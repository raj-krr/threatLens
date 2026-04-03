import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
import pickle, json

df = pd.read_csv('ml_detector/kdd_train.csv', header=None, low_memory=False)

raw_labels = df[41].astype(str)
labels = raw_labels.apply(lambda x: 'normal' if x.strip() == 'normal' else 'attack')

# Convert correct feature columns
feature_cols = [0, 7, 22, 23, 25]
for col in feature_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# FIXED column mapping
features = pd.DataFrame({
    'requests_per_min':          df[22],  # same-host connections (burst rate)
    'unique_endpoints':          df[23],  # unique services accessed
    'avg_time_between_requests': df[0],   # connection duration
    'login_attempts':            df[7],   # num_failed_logins
    'error_rate':                df[25],  # serror_rate
})

# Normalize to match real web app value ranges
features['requests_per_min']          = features['requests_per_min'].clip(0, 512) / 512 * 100
features['unique_endpoints']          = features['unique_endpoints'].clip(0, 512) / 512 * 10
features['avg_time_between_requests'] = features['avg_time_between_requests'].clip(0, 100) / 100 * 8000 + 100
features['login_attempts']            = features['login_attempts'].clip(0, 5)
features['error_rate']                = features['error_rate'].clip(0, 1)

valid_mask = features.notna().all(axis=1)
features   = features[valid_mask].reset_index(drop=True)
labels     = labels[valid_mask].reset_index(drop=True)

print(f"Total rows: {len(features)}")
print(f"Labels:\n{labels.value_counts()}")

attack_ratio = (labels == 'attack').sum() / len(labels)
print(f"Contamination: {attack_ratio:.4f}")

X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# Train only on normal traffic
X_normal       = X_train[y_train == 'normal']
scaler         = StandardScaler()
X_normal_scaled = scaler.fit_transform(X_normal)

model = IsolationForest(contamination=attack_ratio, random_state=42)
model.fit(X_normal_scaled)

# Evaluate
X_test_scaled = scaler.transform(X_test)
preds         = model.predict(X_test_scaled)
preds_label   = ['attack' if p == -1 else 'normal' for p in preds]

report = classification_report(y_test, preds_label, output_dict=True)
print(classification_report(y_test, preds_label))

pickle.dump(model,  open('ml_detector/model.pkl', 'wb'))
pickle.dump(scaler, open('ml_detector/scaler.pkl', 'wb'))

metrics = {
    'model':         'IsolationForest',
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

print('Model retrained on real KDD data!')

# Smoke test
attack_input = scaler.transform(pd.DataFrame([[95, 8, 5, 5, 0.9]],   columns=features.columns))
normal_input  = scaler.transform(pd.DataFrame([[3, 2, 3000, 0, 0.02]], columns=features.columns))
print('Attack result:', model.predict(attack_input))  # Should be [-1]
print('Normal result:', model.predict(normal_input))  # Should be [1]