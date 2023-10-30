import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline, make_union
from sklearn.tree import DecisionTreeClassifier
from tpot.builtins import StackingEstimator
from tpot.export_utils import set_param_recursive


var_1 = pd.read_csv("PATH/TO/DATA/FILE", sep="COLUMN_SEPARATOR", dtype=np.float64)
var_2 = var_1.drop("target", axis=1)
var_3, var_4, var_5, var_6 = train_test_split(
    var_2, var_1["target"], random_state=0
)


var_7 = make_pipeline(
    StackingEstimator(
        estimator=RandomForestClassifier(max_depth=10, n_estimators=1000)
    ),
    DecisionTreeClassifier(
        criterion="entropy", max_depth=1, min_samples_leaf=16, min_samples_split=7
    ),
)

set_param_recursive(var_7.steps, "random_state", 0)

var_7.fit(var_3, var_5)
var_8 = var_7.predict(var_4)
