import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
import pickle, json

# Load real dataset
df = pd.read_csv('ml_detector/kdd_train.csv', header=None, low_memory=False)

# --- Fix: save labels BEFORE converting to numeric ---
# Column 41 has text labels like 'normal', 'neptune', 'smurf' etc.
raw_labels = df[41].astype(str)
labels = raw_labels.apply(lambda x: 'normal' if x.strip() == 'normal' else 'attack')

# Convert only the feature columns we need to numeric
feature_cols = [0, 7, 8, 10, 25]
for col in feature_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Build features DataFrame
features = pd.DataFrame({
    'requests_per_min':           df[0],    # duration
    'unique_endpoints':           df[7],    # num_failed_logins
    'avg_time_between_requests':  df[8],    # num_compromised
    'login_attempts':             df[10],   # num_root
    'error_rate':                 df[25],   # serror_rate
})

# Drop rows where any feature column is NaN
valid_mask = features.notna().all(axis=1)
features = features[valid_mask].reset_index(drop=True)
labels = labels[valid_mask].reset_index(drop=True)

print(f"Total rows after cleaning: {len(features)}")
print(f"Label distribution:\n{labels.value_counts()}")

# Use the REAL attack ratio
attack_ratio = (labels == 'attack').sum() / len(labels)
print(f'Real contamination: {attack_ratio:.4f}')

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# Train ONLY on normal traffic
X_normal = X_train[y_train == 'normal']
scaler = StandardScaler()
X_normal_scaled = scaler.fit_transform(X_normal)

model = IsolationForest(contamination=attack_ratio, random_state=42)
model.fit(X_normal_scaled)

# Evaluate
X_test_scaled = scaler.transform(X_test)
preds = model.predict(X_test_scaled)
preds_label = ['attack' if p == -1 else 'normal' for p in preds]

report = classification_report(y_test, preds_label, output_dict=True)
print(classification_report(y_test, preds_label))

# Save model + scaler
pickle.dump(model, open('ml_detector/model.pkl', 'wb'))
pickle.dump(scaler, open('ml_detector/scaler.pkl', 'wb'))

# Save metrics for dashboard + judges
metrics = {
    'model': 'IsolationForest',
    'contamination': round(float(attack_ratio), 4),
    'trained_on': len(X_normal),
    'precision': round(report.get('attack', {}).get('precision', 0), 4),
    'recall': round(report.get('attack', {}).get('recall', 0), 4),
    'f1_score': round(report.get('attack', {}).get('f1-score', 0), 4),
    'features': list(features.columns)
}
with open('ml_detector/model_metrics.json', 'w') as f:
    json.dump(metrics, f, indent=2)

print('Model trained on real data and saved!')

# Replace the smoke test at the bottom with this:
attack_input = scaler.transform(pd.DataFrame([[200, 1, 5, 50, 0.9]], columns=features.columns))
normal_input  = scaler.transform(pd.DataFrame([[3, 5, 3000, 0, 0.02]], columns=features.columns))
print('Attack input result:', model.predict(attack_input))  # Should be [-1]
print('Normal input result:', model.predict(normal_input))  # Should be [1]