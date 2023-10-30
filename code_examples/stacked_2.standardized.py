import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline, make_union
from sklearn.tree import DecisionTreeClassifier
from tpot.builtins import StackingEstimator
from tpot.export_utils import set_param_recursive

import sys
import os
from sklearn.model_selection import train_test_split, KFold, StratifiedKFold
from sklearn.metrics import accuracy_score, confusion_matrix
from blissful_basics import LazyDict, Csv
import pandas
from tpot import TPOTRegressor, TPOTClassifier
import numpy
from sklearn.neural_network import MLPClassifier

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from generic_tools.misc import pascal_case_with_spaces, no_duplicates
from specific_tools import info, path_to
import specific_tools
from blissful_basics import LazyDict, Csv, FS
from informative_iterator import ProgressBar
from specific_tools import notifier, info, path_to, equal_accuracy_scorer, notify


def var_1():
    var_1 = make_pipeline(
        StackingEstimator(
            estimator=RandomForestClassifier(max_depth=10, n_estimators=1000)
        ),
        DecisionTreeClassifier(
            criterion="entropy", max_depth=1, min_samples_leaf=16, min_samples_split=7
        ),
    )

    set_param_recursive(var_1.steps, "random_state", 0)

    return pipeline


var_2 = specific_tools.create_trainer(
    classifier=var_1(),
    classifier_name="stacked_2",
    module_name=__name__,
)
