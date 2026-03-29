from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# =====================
# 1. COLLABORATIVE FILTERING
# =====================
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    books = data.get('books', [])
    current_book_id = data.get('currentBookId', '')

    if len(books) < 2:
        return jsonify([])

    # Create a DataFrame from books
    df = pd.DataFrame(books)

    # Create feature matrix using price, mrp, and condition
    condition_map = {'New': 4, 'Good': 3, 'Average': 2, 'Poor': 1}
    df['condition_score'] = df['condition'].map(condition_map).fillna(2)
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
    df['mrp'] = pd.to_numeric(df['mrp'], errors='coerce').fillna(0)

    # Feature matrix
    features = df[['price', 'mrp', 'condition_score']].values

    # Calculate cosine similarity
    similarity_matrix = cosine_similarity(features)

    # Find current book index
    book_ids = df['_id'].tolist()
    if current_book_id not in book_ids:
        return jsonify([])

    current_index = book_ids.index(current_book_id)

    # Get similarity scores
    similarity_scores = list(enumerate(similarity_matrix[current_index]))
    similarity_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)

    # Get top 4 similar books (excluding current book)
    recommended = []
    for i, score in similarity_scores:
        if book_ids[i] != current_book_id and score > 0.5:
            recommended.append(books[i])
        if len(recommended) >= 4:
            break

    return jsonify(recommended)


# =====================
# 2. PRICE SUGGESTION
# =====================
@app.route('/suggest-price', methods=['POST'])
def suggest_price():
    data = request.json
    mrp = float(data.get('mrp', 0))
    condition = data.get('condition', 'Good')
    age_years = float(data.get('ageYears', 1))

    # Condition multiplier
    condition_multiplier = {
        'New': 0.85,
        'Good': 0.60,
        'Average': 0.40,
        'Poor': 0.20
    }

    multiplier = condition_multiplier.get(condition, 0.50)

    # Age depreciation (5% per year)
    age_depreciation = max(0.5, 1 - (age_years * 0.05))

    # Suggested price formula
    suggested_price = mrp * multiplier * age_depreciation

    # Round to nearest 10
    suggested_price = round(suggested_price / 10) * 10

    return jsonify({
        'suggestedPrice': suggested_price,
        'minPrice': round(suggested_price * 0.8 / 10) * 10,
        'maxPrice': round(suggested_price * 1.2 / 10) * 10,
    })


@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'PustakHub ML Service is Running!'})


if __name__ == '__main__':
    app.run(port=5001, debug=True)