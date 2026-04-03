import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
import pickle, json

df = pd.read_csv('ml_detector/kdd_train.csv', header=None, low_memory=False)


# Save labels BEFORE touching anything
raw_labels = df[41].astype(str)
labels = raw_labels.apply(lambda x: 'normal' if x.strip() == 'normal' else 'attack')

# Convert only numeric feature columns
feature_cols = [0, 7, 8, 10, 25]
for col in feature_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Build raw features
raw_features = pd.DataFrame({
    'requests_per_min':           df[0],
    'unique_endpoints':           df[7],
    'avg_time_between_requests':  df[8],
    'login_attempts':             df[10],
    'error_rate':                 df[25],
})

# Drop NaN rows
valid_mask = raw_features.notna().all(axis=1)
raw_features = raw_features[valid_mask].reset_index(drop=True)
labels = labels[valid_mask].reset_index(drop=True)

# --- KEY FIX: Re-scale each column to match ThreatLens runtime ranges ---
# This is what ThreatLens actually sends at runtime:
#   requests_per_min       → 0 to 200   (requests per minute from one IP)
#   unique_endpoints       → 0 to 30    (different URLs visited)
#   avg_time_between_reqs  → 50 to 10000 (milliseconds)
#   login_attempts         → 0 to 60    (hits on /login)
#   error_rate             → 0.0 to 1.0 (already correct in NSL-KDD)

scaler_normalize = MinMaxScaler()
features = pd.DataFrame(
    scaler_normalize.fit_transform(raw_features),
    columns=raw_features.columns
)

# Now scale to ThreatLens realistic ranges
features['requests_per_min']          = features['requests_per_min'] * 200
features['unique_endpoints']          = features['unique_endpoints'] * 30
features['avg_time_between_requests'] = features['avg_time_between_requests'] * 9950 + 50
features['login_attempts']            = features['login_attempts'] * 60
# error_rate stays 0.0 to 1.0 — already correct

print(f"Total rows: {len(features)}")
print(f"Label distribution:\n{labels.value_counts()}")
print(f"\nFeature ranges after normalization:")
print(features.describe().loc[['min', 'max']])

attack_ratio = (labels == 'attack').sum() / len(labels)
print(f'\nReal contamination: {attack_ratio:.4f}')


X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)


# Train ONLY on normal traffic
X_normal = X_train[y_train == 'normal']
std_scaler = StandardScaler()
X_normal_scaled = std_scaler.fit_transform(X_normal)


model = IsolationForest(contamination=attack_ratio, random_state=42)
model.fit(X_normal_scaled)

# Evaluate

X_test_scaled = std_scaler.transform(X_test)
preds = model.predict(X_test_scaled)
preds_label = ['attack' if p == -1 else 'normal' for p in preds]


report = classification_report(y_test, preds_label, output_dict=True)
print(classification_report(y_test, preds_label))


# Save
pickle.dump(model, open('ml_detector/model.pkl', 'wb'))
pickle.dump(std_scaler, open('ml_detector/scaler.pkl', 'wb'))

metrics = {
    'model': 'IsolationForest',
    'dataset': 'NSL-KDD (range-normalized to ThreatLens feature space)',

    'contamination': round(float(attack_ratio), 4),
    'trained_on':    len(X_normal),
    'precision':     round(report.get('attack', {}).get('precision', 0), 4),
    'recall':        round(report.get('attack', {}).get('recall', 0), 4),
    'f1_score':      round(report.get('attack', {}).get('f1-score', 0), 4),
    'features':      list(features.columns),
    'dataset':       'KDD Cup 1999 (fixed column mapping)'
}
with open('ml_detector/model_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)


print('\nModel trained and saved!')

# Smoke test — these are realistic ThreatLens values
attack_input = pd.DataFrame(
    [[150, 2, 30, 40, 0.85]],
    columns=features.columns
)
normal_input = pd.DataFrame(
    [[4, 3, 4000, 0, 0.01]],
    columns=features.columns
)
print('Attack result:', model.predict(std_scaler.transform(attack_input)))  # [-1]
print('Normal result:', model.predict(std_scaler.transform(normal_input)))  # [1]

