from flask import Flask, render_template, request
import string
from collections import Counter

app = Flask(__name__)

class ResumeShortlister:
    def __init__(self, job_descriptions, resumes):
        self.job_descriptions = job_descriptions
        self.resumes = resumes

    def preprocess_text(self, text):
        stopwords = set([
            'the', 'is', 'in', 'and', 'to', 'a', 'of', 'for', 'with', 'on', 'it', 'as', 'at', 'by', 'an', 'this', 'that'
        ])
        text = text.lower().translate(str.maketrans("", "", string.punctuation))
        words = set(text.split())
        words = words.difference(stopwords)
        return words

    def calculate_similarity_score(self, job_desc_words, resume_words):
        common_words = job_desc_words.intersection(resume_words)
        return len(common_words), common_words

    def rank_resumes(self):
        results = []
        job_desc = self.job_descriptions[0]
        job_words = self.preprocess_text(job_desc)

        for resume in self.resumes:
            resume_words = self.preprocess_text(resume)
            score, common_words = self.calculate_similarity_score(job_words, resume_words)
            percentage_match = (score / len(job_words)) * 100 if job_words else 0
            results.append({
                'resume': resume,
                'score': score,
                'match': f"{percentage_match:.2f}%",
                'common_words': ', '.join(common_words)
            })

        results.sort(key=lambda x: x['score'], reverse=True)
        return job_desc, results

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        job_description = request.form.get("job_description")
        resumes_text = request.form.get("resumes")
        resumes = [r.strip() for r in resumes_text.strip().split("\n") if r.strip()]
        shortlister = ResumeShortlister([job_description], resumes)
        job_desc, results = shortlister.rank_resumes()
        return render_template("index.html", results=results, job_description=job_desc)
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
