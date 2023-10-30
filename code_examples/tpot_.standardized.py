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

var_1 = path_to.b_rapa_denovo
(
    x_train,
    x_test,
    y_train,
    y_test,
    test_accuracy_of,
    *_,
) = specific_tools.standard_load_train_test(var_1, test_proportion=0.15)


var_2 = path_to.results + f"/recent_tpot.log"
var_3 = path_to.models + f"/tpot_pipeline.ignore/"
FS.ensure_is_folder(var_3)
var_4 = {
    "sklearn.tree.DecisionTreeClassifier": {
        "criterion": ["gini", "entropy"],
        "max_depth": range(1, 11),
        "min_samples_split": range(2, 21),
        "min_samples_leaf": range(1, 21),
    },
    "sklearn.ensemble.RandomForestClassifier": dict(
        n_estimators=[
            200,
            500,
            1000,
        ],
        max_depth=[10, 20, 25, 50, 80],
    ),
    "sklearn.neural_network.MLPClassifier": dict(
        activation=["tanh", "logistic", "relu"],
        hidden_layer_sizes=[
            (20),
            (10, 10),
            (15, 10),
            (20, 10),
        ],
        solver=["lbfgs", "adam", "sgd"],
        alpha=[0.0001, 0.001, 0.01, 0.1],
        learning_rate_init=[0.001, 0.01, 0.1, 0.5, 1.0],
    ),
    "sklearn.neighbors.KNeighborsClassifier": {
        "n_neighbors": range(1, 101),
        "weights": ["uniform", "distance"],
        "p": [1, 2],
    },
    "sklearn.preprocessing.Normalizer": {"norm": ["l1", "l2", "max"]},
}


var_5 = FS.basename(var_1)
var_6 = None
var_7 = []
var_8 = 0
var_9 = 48 * 60
var_10 = "f1"
with notify.when_done:
    var_11 = TPOTClassifier(
        verbosity=3,
        scoring="f1",
        n_jobs=2,
        max_time_mins=var_9,
        periodic_checkpoint_folder=var_3,
        random_state=0,
        log_file=var_2,
        config_dict=var_4,
    )
    var_11.fit(x_train, y_train)
    var_7.append(
        dict(
            name=var_10,
            train_time=var_9,
            **test_accuracy_of(var_11.predict),
        )
    )
    var_11.export(
        path_to.models + f"/tpot_{var_5}_{var_8}_{var_9}_{var_10}.py"
    )
    var_6 = pandas.DataFrame(var_7)
    var_6.to_csv(path_to.results + "/recent_tpot_results.csv")
