"""
Database models and initialization for Food Recommendation System
Uses SQLite for persistent data storage
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional

DATABASE_FILE = "data/efood.db"

def init_database():
    """Initialize database with required tables"""
    os.makedirs("data", exist_ok=True)
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at INTEGER NOT NULL
        )
    ''')
    
    # User profiles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            email TEXT PRIMARY KEY,
            age INTEGER,
            gender TEXT,
            height_cm REAL,
            weight_kg REAL,
            bmi REAL,
            allergies TEXT,
            health_conditions TEXT,
            updated_at INTEGER NOT NULL,
            FOREIGN KEY(email) REFERENCES users(email)
        )
    ''')
    
    # Saved foods table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS saved_foods (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            food_id TEXT NOT NULL,
            food_name TEXT NOT NULL,
            category TEXT,
            unhealthy_percentage REAL,
            saved_at INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    ''')
    
    # Feedback tickets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback_tickets (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            subject TEXT NOT NULL,
            description TEXT NOT NULL,
            contact_name TEXT,
            contact_email TEXT NOT NULL,
            proof_data_url TEXT,
            status TEXT DEFAULT 'Received',
            created_at INTEGER NOT NULL
        )
    ''')
    
    # Community posts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS community_posts (
            id TEXT PRIMARY KEY,
            author_email TEXT NOT NULL,
            caption TEXT NOT NULL,
            image_data_url TEXT,
            likes INTEGER DEFAULT 0,
            created_at INTEGER NOT NULL,
            FOREIGN KEY(author_email) REFERENCES users(email)
        )
    ''')
    
    # Contact submissions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_submissions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            submitted_at INTEGER NOT NULL
        )
    ''')
    
    conn.commit()
    conn.close()

# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

class Database:
    @staticmethod
    def execute(query: str, params: tuple = (), fetch_one: bool = False, fetch_all: bool = False):
        """Execute database query"""
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        try:
            cursor.execute(query, params)
            conn.commit()
            if fetch_one:
                result = cursor.fetchone()
                return dict(result) if result else None
            elif fetch_all:
                results = cursor.fetchall()
                return [dict(row) for row in results]
            return None
        finally:
            conn.close()

# ============================================================================
# USER OPERATIONS
# ============================================================================

def save_user(user_id: str, name: str, email: str, password: str) -> bool:
    """Save user to database"""
    try:
        Database.execute(
            'INSERT INTO users (id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
            (user_id, name, email, password, int(datetime.now().timestamp()))
        )
        return True
    except:
        return False

def get_user(email: str) -> Optional[Dict]:
    """Get user by email"""
    return Database.execute(
        'SELECT * FROM users WHERE email = ?',
        (email,),
        fetch_one=True
    )

def get_all_users() -> List[Dict]:
    """Get all users"""
    return Database.execute(
        'SELECT * FROM users',
        fetch_all=True
    ) or []

# ============================================================================
# USER PROFILE OPERATIONS
# ============================================================================

def save_user_profile(email: str, profile: Dict) -> bool:
    """Save user profile"""
    try:
        Database.execute(
            '''INSERT OR REPLACE INTO user_profiles 
               (email, age, gender, height_cm, weight_kg, bmi, allergies, health_conditions, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                email,
                profile.get('age', 0),
                profile.get('gender', 'Prefer not to say'),
                profile.get('heightCm', 0),
                profile.get('weightKg', 0),
                profile.get('bmi', 0),
                json.dumps(profile.get('allergies', [])),
                json.dumps(profile.get('selectedHealthConditions', [])),
                int(datetime.now().timestamp())
            )
        )
        return True
    except:
        return False

def get_user_profile(email: str) -> Optional[Dict]:
    """Get user profile"""
    result = Database.execute(
        'SELECT * FROM user_profiles WHERE email = ?',
        (email,),
        fetch_one=True
    )
    if result:
        result['allergies'] = json.loads(result.get('allergies', '[]'))
        result['selectedHealthConditions'] = json.loads(result.get('health_conditions', '[]'))
    return result

# ============================================================================
# SAVED FOODS OPERATIONS
# ============================================================================

def save_food(user_id: str, food_data: Dict) -> bool:
    """Save food for user"""
    try:
        Database.execute(
            '''INSERT INTO saved_foods 
               (id, user_id, food_id, food_name, category, unhealthy_percentage, saved_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (
                str(int(datetime.now().timestamp() * 1000)),
                user_id,
                food_data.get('foodId'),
                food_data.get('foodName'),
                food_data.get('category'),
                food_data.get('unhealthyPercentage'),
                int(datetime.now().timestamp())
            )
        )
        return True
    except:
        return False

def get_saved_foods(user_id: str) -> List[Dict]:
    """Get saved foods for user"""
    return Database.execute(
        'SELECT * FROM saved_foods WHERE user_id = ? ORDER BY saved_at DESC',
        (user_id,),
        fetch_all=True
    ) or []

def remove_saved_food(food_id: str) -> bool:
    """Remove saved food"""
    try:
        Database.execute('DELETE FROM saved_foods WHERE id = ?', (food_id,))
        return True
    except:
        return False

# ============================================================================
# FEEDBACK OPERATIONS
# ============================================================================

def save_feedback(feedback_data: Dict) -> bool:
    """Save feedback ticket"""
    try:
        Database.execute(
            '''INSERT INTO feedback_tickets 
               (id, category, subject, description, contact_name, contact_email, proof_data_url, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                str(int(datetime.now().timestamp() * 1000)),
                feedback_data.get('category'),
                feedback_data.get('subject'),
                feedback_data.get('description'),
                feedback_data.get('contactName'),
                feedback_data.get('contactEmail'),
                feedback_data.get('proofDataUrl'),
                'Received',
                int(datetime.now().timestamp())
            )
        )
        return True
    except:
        return False

def get_all_feedback() -> List[Dict]:
    """Get all feedback tickets"""
    return Database.execute(
        'SELECT * FROM feedback_tickets ORDER BY created_at DESC',
        fetch_all=True
    ) or []

# ============================================================================
# COMMUNITY OPERATIONS
# ============================================================================

def save_community_post(email: str, post_data: Dict) -> bool:
    """Save community post"""
    try:
        Database.execute(
            '''INSERT INTO community_posts 
               (id, author_email, caption, image_data_url, created_at)
               VALUES (?, ?, ?, ?, ?)''',
            (
                str(int(datetime.now().timestamp() * 1000)),
                email,
                post_data.get('caption'),
                post_data.get('imageDataUrl'),
                int(datetime.now().timestamp())
            )
        )
        return True
    except:
        return False

def get_all_community_posts() -> List[Dict]:
    """Get all community posts"""
    return Database.execute(
        'SELECT * FROM community_posts ORDER BY created_at DESC',
        fetch_all=True
    ) or []

def get_user_community_posts(email: str) -> List[Dict]:
    """Get community posts by user"""
    return Database.execute(
        'SELECT * FROM community_posts WHERE author_email = ? ORDER BY created_at DESC',
        (email,),
        fetch_all=True
    ) or []

# ============================================================================
# CONTACT OPERATIONS
# ============================================================================

def save_contact_submission(contact_data: Dict) -> bool:
    """Save contact submission"""
    try:
        Database.execute(
            '''INSERT INTO contact_submissions 
               (id, name, email, subject, message, submitted_at)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (
                str(int(datetime.now().timestamp() * 1000)),
                contact_data.get('name'),
                contact_data.get('email'),
                contact_data.get('subject'),
                contact_data.get('message'),
                int(datetime.now().timestamp())
            )
        )
        return True
    except:
        return False

def get_all_contact_submissions() -> List[Dict]:
    """Get all contact submissions"""
    return Database.execute(
        'SELECT * FROM contact_submissions ORDER BY submitted_at DESC',
        fetch_all=True
    ) or []

def get_user_contact_submissions(email: str) -> List[Dict]:
    """Get contact submissions by user"""
    return Database.execute(
        'SELECT * FROM contact_submissions WHERE email = ? ORDER BY submitted_at DESC',
        (email,),
        fetch_all=True
    ) or []
