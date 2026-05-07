from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)
CORS(app)

# =====================
# 1. COLLABORATIVE FILTERING (Genre Based)
# =====================
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    books = data.get('books', [])
    current_book_id = data.get('currentBookId', '')

    if len(books) < 2:
        return jsonify([])

    df = pd.DataFrame(books)

    # Find current book
    current_books = df[df['_id'] == current_book_id]
    if current_books.empty:
        return jsonify([])

    current_book = current_books.iloc[0]
    current_genre = current_book.get('genre', 'Other')

    # First filter by same genre
    same_genre_books = df[
        (df['genre'] == current_genre) &
        (df['_id'] != current_book_id)
    ]

    if len(same_genre_books) >= 4:
        # Use cosine similarity within same genre
        condition_map = {'New': 4, 'Good': 3, 'Average': 2, 'Poor': 1}
        same_genre_books = same_genre_books.copy()
        same_genre_books['condition_score'] = same_genre_books['condition'].map(condition_map).fillna(2)
        same_genre_books['price'] = pd.to_numeric(same_genre_books['price'], errors='coerce').fillna(0)
        same_genre_books['mrp'] = pd.to_numeric(same_genre_books['mrp'], errors='coerce').fillna(0)

        features = same_genre_books[['price', 'mrp', 'condition_score']].values

        # Current book features
        current_condition = condition_map.get(current_book.get('condition', 'Good'), 2)
        current_features = np.array([[
            float(current_book.get('price', 0)),
            float(current_book.get('mrp', 0)),
            current_condition
        ]])

        similarities = cosine_similarity(current_features, features)[0]
        same_genre_books = same_genre_books.copy()
        same_genre_books['similarity'] = similarities
        same_genre_books = same_genre_books.sort_values('similarity', ascending=False)

        recommended = same_genre_books.head(4).to_dict('records')
        return jsonify(recommended)

    else:
        # Not enough same genre books, fill with other similar books
        other_books = df[df['_id'] != current_book_id]
        condition_map = {'New': 4, 'Good': 3, 'Average': 2, 'Poor': 1}
        other_books = other_books.copy()
        other_books['condition_score'] = other_books['condition'].map(condition_map).fillna(2)
        other_books['price'] = pd.to_numeric(other_books['price'], errors='coerce').fillna(0)
        other_books['mrp'] = pd.to_numeric(other_books['mrp'], errors='coerce').fillna(0)

        features = other_books[['price', 'mrp', 'condition_score']].values

        current_condition = condition_map.get(current_book.get('condition', 'Good'), 2)
        current_features = np.array([[
            float(current_book.get('price', 0)),
            float(current_book.get('mrp', 0)),
            current_condition
        ]])

        similarities = cosine_similarity(current_features, features)[0]
        other_books = other_books.copy()
        other_books['similarity'] = similarities
        other_books = other_books.sort_values('similarity', ascending=False)

        recommended = other_books.head(4).to_dict('records')
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

    condition_multiplier = {
        'New': 0.85,
        'Good': 0.60,
        'Average': 0.40,
        'Poor': 0.20
    }

    multiplier = condition_multiplier.get(condition, 0.50)
    age_depreciation = max(0.5, 1 - (age_years * 0.05))
    suggested_price = mrp * multiplier * age_depreciation
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