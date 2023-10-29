import sys
import os

from sklearn.model_selection import train_test_split, KFold, StratifiedKFold
from sklearn.metrics import accuracy_score, confusion_matrix
from blissful_basics import LazyDict, Csv, FS
import pandas
from tpot import TPOTRegressor, TPOTClassifier
import numpy
import numpy as np

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from informative_iterator import ProgressBar

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from generic_tools.misc import pascal_case_with_spaces, no_duplicates
from specific_tools import notifier, info, path_to, equal_accuracy_scorer, notify
import specific_tools

path = path_to.b_rapa_denovo
x_train, x_test, y_train, y_test, test_accuracy_of, *_ = specific_tools.standard_load_train_test(path, test_proportion=0.15)

# 
# setup tpot
# 
tpot_log_file = path_to.results+f"/recent_tpot.log"
tpot_checkpoints_folder = path_to.models+f"/tpot_pipeline.ignore/"
FS.ensure_is_folder(tpot_checkpoints_folder)
tpot_config = {
    'sklearn.tree.DecisionTreeClassifier': {
        'criterion': ["gini", "entropy"],
        'max_depth': range(1, 11),
        'min_samples_split': range(2, 21),
        'min_samples_leaf': range(1, 21)
    },
    'sklearn.ensemble.RandomForestClassifier': dict(
        n_estimators=[ 200, 500, 1000, ],
        max_depth=[ 10, 20, 25, 50, 80 ],
    ),
    'sklearn.neural_network.MLPClassifier': dict(
        activation=[ 'tanh', 'logistic', 'relu'],
        hidden_layer_sizes=[
            (20),
            (10,10),
            (15,10),
            (20,10),
        ],
        solver=['lbfgs','adam','sgd'],
        alpha=[
            0.0001,
            0.001,
            0.01,
            0.1
        ],
        learning_rate_init=[
            0.001,
            0.01,
            0.1,
            0.5,
            1.0
        ],
    ),
    "sklearn.neighbors.KNeighborsClassifier": {
        "n_neighbors": range(1, 101),
        "weights": [
            "uniform",
            "distance"
        ],
        "p": [
            1,
            2
        ]
    },
    # Preprocesssors
        # 'sklearn.cluster.FeatureAgglomeration': {
        #     'linkage': ['ward', 'complete', 'average'],
        #     'affinity': ['euclidean', 'l1', 'l2', 'manhattan', 'cosine']
        # },
        # 'sklearn.preprocessing.MaxAbsScaler': {
        # },
        # 'sklearn.preprocessing.MinMaxScaler': {
        # },
    'sklearn.preprocessing.Normalizer': {
        'norm': ['l1', 'l2', 'max']
    },
}

# 
# 
# Auto ML
# 
# 
name = FS.basename(path)
tpot_data_frame = None
tpot_data = []
index = 0
each_time = 48 * 60
each_score_type = "f1"
with notify.when_done:
    tpot_automl = TPOTClassifier(
        # generations=10,
        # population_size=10,
        verbosity=3,
        scoring='f1',
        n_jobs=2, # -2 = utilze all but 1 CPU
        max_time_mins=each_time,
        periodic_checkpoint_folder=tpot_checkpoints_folder,
        random_state=0,
        log_file=tpot_log_file,
        config_dict=tpot_config,
    )
    tpot_automl.fit(x_train, y_train)
    tpot_data.append(dict(name=each_score_type, train_time=each_time, **test_accuracy_of(tpot_automl.predict)))
    tpot_automl.export(path_to.models+f'/tpot_{name}_{index}_{each_time}_{each_score_type}.py')
    tpot_data_frame = pandas.DataFrame(tpot_data)
    tpot_data_frame.to_csv(path_to.results+"/recent_tpot_results.csv")