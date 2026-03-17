"""
MongoDB Configuration and Connection
"""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient


logger = logging.getLogger(__name__)
BACKEND_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_DIR / '.env')

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'legal_saathi_db')

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    db = client[DATABASE_NAME]
    logger.info('MongoDB connected successfully')
except Exception as e:
    logger.error('MongoDB connection failed: %s', e)
    db = None

def get_db():
    """Get database instance"""
    return db
