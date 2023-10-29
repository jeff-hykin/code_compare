import sys
import os

from sklearn.model_selection import train_test_split, KFold, StratifiedKFold
from sklearn.metrics import accuracy_score, confusion_matrix
from blissful_basics import LazyDict, Csv
import pandas
from tpot import TPOTRegressor, TPOTClassifier
import numpy

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from generic_tools.misc import pascal_case_with_spaces, no_duplicates
from specific_tools import info, path_to
import specific_tools

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

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline, make_union
from sklearn.tree import DecisionTreeClassifier
from tpot.builtins import StackingEstimator
from tpot.export_utils import set_param_recursive

# Average CV score on the training set was: 0.5849572019931524
def make_classifier():
    pipeline =  make_pipeline(
        StackingEstimator(
            estimator=MLPClassifier(
                activation="relu",
                alpha=0.01,
                hidden_layer_sizes=(15, 10),
                learning_rate_init=0.1,
                solver="adam"
            )
        ),
        DecisionTreeClassifier(
            criterion="entropy",
            max_depth=2,
            min_samples_leaf=8,
            min_samples_split=9
        ),
    )
    # Fix random state for all the steps in exported pipeline
    set_param_recursive(pipeline.steps, 'random_state', 0)
    return pipeline

train = specific_tools.create_trainer(
    classifier=make_classifier(),
    classifier_name="stacked_1",
    module_name=__name__,
)