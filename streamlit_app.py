"""Streamlit demo application for Resume Screening System."""

import streamlit as st
import requests
import io
import json
from typing import List
import pandas as pd

# Page configuration
st.set_page_config(
    page_title="Resume Screening & Skill Matching",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Styling
st.markdown("""
<style>
    .metric-card {
        padding: 20px;
        border-radius: 10px;
        background-color: #f0f2f6;
        border-left: 5px solid #1f77b4;
        margin-bottom: 10px;
    }
    .rank-1 {
        background-color: #ffd700;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    .rank-2 {
        background-color: #c0c0c0;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    .rank-3 {
        background-color: #cd7f32;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# API endpoint
API_URL = "http://localhost:8000"

# App title
st.title("📄 Resume Screening & Skill Matching System")
st.markdown("""
Automatically screen and rank candidates based on job descriptions using NLP and semantic similarity.
""")

# Sidebar - Configuration
with st.sidebar:
    st.header("⚙️ Configuration")
    
    # API status check
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200:
            st.success("✅ API Connected")
        else:
            st.error("❌ API Error")
    except:
        st.error("❌ Cannot connect to API. Make sure the backend is running on http://localhost:8000")
    
    st.markdown("---")
    st.markdown("### About")
    st.markdown("""
    **Scoring Logic:**
    - **Semantic Similarity (70%)**: Measures how well resume content matches job description
    - **Skill Match (30%)**: Percentage of required skills found in resume
    
    **Final Score = 0.7 × Semantic Similarity + 0.3 × Skill Match**
    """)
    
    st.markdown("---")
    st.markdown("### Supported File Types")
    st.markdown("- PDF (.pdf)")
    st.markdown("- Word Document (.docx)")

# Main content
tab1, tab2, tab3 = st.tabs(["📊 Batch Screening", "🎯 Single Resume", "🔍 Extract Skills"])

# Tab 1: Batch Screening
with tab1:
    st.header("Batch Resume Screening")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("📋 Job Description")
        job_description = st.text_area(
            "Enter job description:",
            height=250,
            placeholder="Paste the complete job description here...",
            key="batch_job_desc"
        )
    
    with col2:
        st.subheader("📁 Upload Resumes")
        uploaded_files = st.file_uploader(
            "Upload resume files (PDF or DOCX)",
            type=["pdf", "docx"],
            accept_multiple_files=True,
            key="batch_resumes"
        )
        
        if uploaded_files:
            st.info(f"📌 {len(uploaded_files)} file(s) selected")
            for file in uploaded_files:
                st.caption(f"• {file.name}")
    
    # Submit button
    if st.button("🚀 Screen Resumes", key="batch_submit", use_container_width=True):
        if not job_description.strip():
            st.error("❌ Please enter a job description")
        elif not uploaded_files:
            st.error("❌ Please upload at least one resume")
        else:
            with st.spinner("🔄 Screening resumes... This may take a minute..."):
                try:
                    # Prepare files
                    files = []
                    for uploaded_file in uploaded_files:
                        files.append(
                            ("resumes", (uploaded_file.name, uploaded_file.getbuffer(), uploaded_file.type))
                        )
                    
                    # Make API request
                    response = requests.post(
                        f"{API_URL}/api/screen-resumes",
                        files=files,
                        data={"job_description": job_description}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        if result.get("status") == "success":
                            data = result.get("data", {})
                            
                            # Display summary
                            st.success("✅ Screening completed successfully!")
                            
                            st.subheader("📊 Screening Summary")
                            
                            summary = data.get("summary", {})
                            col1, col2, col3, col4 = st.columns(4)
                            
                            with col1:
                                st.metric(
                                    "Total Candidates",
                                    summary.get("total_candidates", 0)
                                )
                            
                            with col2:
                                st.metric(
                                    "Average Score",
                                    f"{summary.get('average_score_percentage', 0):.1f}%"
                                )
                            
                            with col3:
                                st.metric(
                                    "Top Candidate",
                                    summary.get("top_candidate", "N/A")
                                )
                            
                            with col4:
                                st.metric(
                                    "Top Score",
                                    f"{summary.get('top_candidate_score', 0):.1%}"
                                )
                            
                            # Display job requirements
                            st.subheader("💼 Job Requirements")
                            job_summary = data.get("job_description_summary", {})
                            st.markdown(f"**Required Skills:** {job_summary.get('skill_count', 0)}")
                            
                            skills_list = job_summary.get("required_skills", [])
                            if skills_list:
                                skill_cols = st.columns(4)
                                for idx, skill in enumerate(skills_list):
                                    with skill_cols[idx % 4]:
                                        st.tag(skill, label=skill)
                            
                            # Display ranked candidates
                            st.subheader("🏆 Ranked Candidates")
                            
                            candidates = data.get("ranked_candidates", [])
                            
                            for idx, candidate in enumerate(candidates, 1):
                                # Determine styling based on rank
                                if idx == 1:
                                    rank_style = "rank-1"
                                elif idx == 2:
                                    rank_style = "rank-2"
                                elif idx == 3:
                                    rank_style = "rank-3"
                                else:
                                    rank_style = None
                                
                                with st.expander(
                                    f"{'🥇' if idx == 1 else '🥈' if idx == 2 else '🥉' if idx == 3 else '  '} "
                                    f"Rank {idx}: {candidate['candidate_name']} - "
                                    f"{candidate['final_score_percentage']:.1f}%"
                                ):
                                    col1, col2, col3 = st.columns(3)
                                    
                                    with col1:
                                        st.metric(
                                            "Final Score",
                                            f"{candidate['final_score_percentage']:.2f}%",
                                            delta=None
                                        )
                                    
                                    with col2:
                                        st.metric(
                                            "Semantic Similarity",
                                            f"{candidate['semantic_similarity_percentage']:.2f}%"
                                        )
                                    
                                    with col3:
                                        skill_match = candidate['skill_match']
                                        st.metric(
                                            "Skill Match",
                                            f"{skill_match['percentage']:.1f}%",
                                            f"{skill_match['matched_count']}/{skill_match['required_count']}"
                                        )
                                    
                                    st.markdown("#### Skills Analysis")
                                    
                                    skill_col1, skill_col2, skill_col3 = st.columns(3)
                                    
                                    with skill_col1:
                                        st.markdown("**✅ Matched Skills**")
                                        matched = candidate['skill_match']['matched_skills']
                                        if matched:
                                            for skill in matched:
                                                st.caption(f"✓ {skill}")
                                        else:
                                            st.caption("None")
                                    
                                    with skill_col2:
                                        st.markdown("**❌ Missing Skills**")
                                        missing = candidate['skill_match']['missing_skills']
                                        if missing:
                                            for skill in missing:
                                                st.caption(f"✗ {skill}")
                                        else:
                                            st.caption("All skills matched!")
                                    
                                    with skill_col3:
                                        st.markdown("**⭐ Additional Skills**")
                                        additional = candidate['skill_match']['additional_skills']
                                        if additional:
                                            for skill in additional[:5]:
                                                st.caption(f"• {skill}")
                                            if len(additional) > 5:
                                                st.caption(f"... and {len(additional) - 5} more")
                                        else:
                                            st.caption("None")
                                    
                                    st.markdown("#### Analysis")
                                    explanation = candidate['explanation']
                                    for key, value in explanation.items():
                                        st.info(value)
                            
                            # Download results
                            st.subheader("💾 Download Results")
                            
                            # CSV export
                            csv_data = []
                            for candidate in candidates:
                                csv_data.append({
                                    'Rank': candidate.get('rank'),
                                    'Candidate': candidate['candidate_name'],
                                    'Final Score': f"{candidate['final_score_percentage']:.2f}%",
                                    'Semantic Similarity': f"{candidate['semantic_similarity_percentage']:.2f}%",
                                    'Skill Match': f"{candidate['skill_match']['percentage']:.1f}%",
                                    'Matched Skills': ', '.join(candidate['skill_match']['matched_skills']),
                                    'Missing Skills': ', '.join(candidate['skill_match']['missing_skills']),
                                })
                            
                            df = pd.DataFrame(csv_data)
                            csv_buffer = io.StringIO()
                            df.to_csv(csv_buffer, index=False)
                            
                            st.download_button(
                                label="📥 Download Results (CSV)",
                                data=csv_buffer.getvalue(),
                                file_name="screening_results.csv",
                                mime="text/csv"
                            )
                            
                            # JSON export
                            json_data = json.dumps(data, indent=2)
                            st.download_button(
                                label="📥 Download Results (JSON)",
                                data=json_data,
                                file_name="screening_results.json",
                                mime="application/json"
                            )
                        else:
                            st.error(f"❌ {result.get('message', 'Screening failed')}")
                    else:
                        st.error(f"❌ API Error: {response.status_code}")
                
                except requests.exceptions.ConnectionError:
                    st.error("❌ Cannot connect to API. Make sure the backend is running on http://localhost:8000")
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

# Tab 2: Single Resume Scoring
with tab2:
    st.header("Score Single Resume")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.subheader("📋 Job Description")
        single_job_desc = st.text_area(
            "Enter job description:",
            height=250,
            placeholder="Paste the job description here...",
            key="single_job_desc"
        )
    
    with col2:
        st.subheader("📄 Upload Resume")
        single_resume = st.file_uploader(
            "Upload a single resume",
            type=["pdf", "docx"],
            key="single_resume"
        )
    
    if st.button("📊 Score Resume", key="single_submit", use_container_width=True):
        if not single_job_desc.strip():
            st.error("❌ Please enter a job description")
        elif not single_resume:
            st.error("❌ Please upload a resume")
        else:
            with st.spinner("🔄 Scoring resume..."):
                try:
                    files = [("resume", (single_resume.name, single_resume.getbuffer(), single_resume.type))]
                    
                    response = requests.post(
                        f"{API_URL}/api/score-single",
                        files=files,
                        data={"job_description": single_job_desc}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        if result.get("status") == "success":
                            candidate = result.get("data", {})
                            
                            st.success("✅ Resume scored successfully!")
                            
                            col1, col2, col3 = st.columns(3)
                            
                            with col1:
                                st.metric(
                                    "Final Score",
                                    f"{candidate['final_score_percentage']:.2f}%"
                                )
                            
                            with col2:
                                st.metric(
                                    "Semantic Similarity",
                                    f"{candidate['semantic_similarity_percentage']:.2f}%"
                                )
                            
                            with col3:
                                skill_match = candidate['skill_match']
                                st.metric(
                                    "Skill Match",
                                    f"{skill_match['percentage']:.1f}%"
                                )
                            
                            st.subheader("Skills Analysis")
                            
                            skill_col1, skill_col2, skill_col3 = st.columns(3)
                            
                            with skill_col1:
                                st.markdown("### ✅ Matched Skills")
                                for skill in candidate['skill_match']['matched_skills']:
                                    st.caption(f"✓ {skill}")
                            
                            with skill_col2:
                                st.markdown("### ❌ Missing Skills")
                                missing = candidate['skill_match']['missing_skills']
                                if missing:
                                    for skill in missing:
                                        st.caption(f"✗ {skill}")
                                else:
                                    st.caption("All skills matched! 🎉")
                            
                            with skill_col3:
                                st.markdown("### ⭐ Additional Skills")
                                additional = candidate['skill_match']['additional_skills']
                                if additional:
                                    for skill in additional[:10]:
                                        st.caption(f"• {skill}")
                                else:
                                    st.caption("No additional skills")
                            
                            st.subheader("Detailed Analysis")
                            for key, value in candidate['explanation'].items():
                                st.info(value)
                        else:
                            st.error(f"❌ {result.get('message', 'Scoring failed')}")
                    else:
                        st.error(f"❌ API Error: {response.status_code}")
                
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

# Tab 3: Skill Extraction
with tab3:
    st.header("Extract Skills")
    
    st.subheader("📋 Job Description")
    skills_job_desc = st.text_area(
        "Enter job description to extract skills:",
        height=300,
        placeholder="Paste the job description here...",
        key="skills_job_desc"
    )
    
    if st.button("🔍 Extract Skills", key="extract_submit", use_container_width=True):
        if not skills_job_desc.strip():
            st.error("❌ Please enter a job description")
        else:
            with st.spinner("🔄 Extracting skills..."):
                try:
                    response = requests.get(
                        f"{API_URL}/api/extract-skills",
                        params={"job_description": skills_job_desc}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        
                        if result.get("status") == "success":
                            data = result.get("data", {})
                            
                            st.success("✅ Skills extracted successfully!")
                            
                            st.metric("Total Skills Found", data['skill_count'])
                            
                            st.subheader("Extracted Skills")
                            
                            skills = data.get('skills', [])
                            if skills:
                                # Display skills in columns
                                cols = st.columns(4)
                                for idx, skill in enumerate(skills):
                                    with cols[idx % 4]:
                                        st.tag(skill, label=skill)
                                
                                # Display details
                                st.subheader("Skill Details")
                                details = data.get('details', {})
                                for skill, detail in details.items():
                                    with st.expander(skill):
                                        st.markdown(f"**Aliases found:** {', '.join(detail.get('aliases_matched', []))}")
                            else:
                                st.info("No skills found in the provided text")
                        else:
                            st.error(f"❌ {result.get('message', 'Extraction failed')}")
                    else:
                        st.error(f"❌ API Error: {response.status_code}")
                
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; margin-top: 30px; color: #666;">
    <p>Resume Screening & Skill Matching System | Built with Streamlit, FastAPI, and Sentence Transformers</p>
</div>
""", unsafe_allow_html=True)
