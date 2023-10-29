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

# Average CV score on the training set was: 0.5849572019931524
def make_classifier():
    # Average CV score on the training set was: 0.39536015063344154
    exported_pipeline = make_pipeline(
        StackingEstimator(
            estimator=RandomForestClassifier(
                max_depth=10,
                n_estimators=1000
            )
        ),
        DecisionTreeClassifier(
            criterion="entropy",
            max_depth=1,
            min_samples_leaf=16,
            min_samples_split=7
        ),
    )
    # Fix random state for all the steps in exported pipeline
    set_param_recursive(exported_pipeline.steps, 'random_state', 0)
    
    return pipeline

train = specific_tools.create_trainer(
    classifier=make_classifier(),
    classifier_name="stacked_2",
    module_name=__name__,
)