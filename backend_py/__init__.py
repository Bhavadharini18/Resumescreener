"""Initialize backend package."""

__version__ = "1.0.0"
__author__ = "Resume Screening Team"

import logging

# Configure package-level logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Resume Screening Backend Package Initialized")
