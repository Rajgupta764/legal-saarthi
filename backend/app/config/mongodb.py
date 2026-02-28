"""
MongoDB Configuration and Connection
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'legal_saathi_db')

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    # Verify connection
    client.admin.command('ping')
    db = client[DATABASE_NAME]
    print("✓ MongoDB connected successfully")
except Exception as e:
    print(f"✗ MongoDB connection failed: {e}")
    db = None

def get_db():
    """Get database instance"""
    return db
