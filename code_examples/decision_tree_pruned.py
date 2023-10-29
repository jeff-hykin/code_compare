import sys,pandas,sklearn,numpy
from sklearn.model_selection import train_test_split,KFold,StratifiedKFold
from sklearn.tree import DecisionTreeClassifier

# Mimics a decision tree but does pruning upon .fit(x,y)
class PrunedDecisionTree:
    def __init__(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        self.clf = DecisionTreeClassifier(*args, **kwargs)
    
    @property
    def ccp_alpha(self):                    return self.clf.ccp_alpha
    @property
    def class_weight(self):                 return self.clf.class_weight
    @property
    def classes_(self):                     return self.clf.classes_
    @property
    def criterion(self):                    return self.clf.criterion
    @property
    def feature_importances_(self):         return self.clf.feature_importances_
    @property
    def max_depth(self):                    return self.clf.max_depth
    @property
    def max_features(self):                 return self.clf.max_features
    @property
    def max_features_(self):                return self.clf.max_features_
    @property
    def max_leaf_nodes(self):               return self.clf.max_leaf_nodes
    @property
    def min_impurity_decrease(self):        return self.clf.min_impurity_decrease
    @property
    def min_samples_leaf(self):             return self.clf.min_samples_leaf
    @property
    def min_samples_split(self):            return self.clf.min_samples_split
    @property
    def min_weight_fraction_leaf(self):     return self.clf.min_weight_fraction_leaf
    @property
    def n_classes_(self):                   return self.clf.n_classes_
    @property
    def n_features_(self):                  return self.clf.n_features_
    @property
    def n_features_in_(self):               return self.clf.n_features_in_
    @property
    def n_outputs_(self):                   return self.clf.n_outputs_
    @property
    def random_state(self):                 return self.clf.random_state
    @property
    def splitter(self):                     return self.clf.splitter
    @property
    def tree_(self):                        return self.clf.tree_
    @property
    def apply(self):                        return self.clf.apply
    @property
    def cost_complexity_pruning_path(self): return self.clf.cost_complexity_pruning_path
    @property
    def decision_path(self):                return self.clf.decision_path
    @property
    def fit(self):                          return self.clf.fit
    @property
    def get_depth(self):                    return self.clf.get_depth
    @property
    def get_n_leaves(self):                 return self.clf.get_n_leaves
    @property
    def get_params(self):                   return self.clf.get_params
    @property
    def predict(self):                      return self.clf.predict
    @property
    def predict_log_proba(self):            return self.clf.predict_log_proba
    @property
    def predict_proba(self):                return self.clf.predict_proba
    @property
    def score(self):                        return self.clf.score
    @property
    def set_params(self):                   return self.clf.set_params
    @property
    def _abc_impl(self):                    return self.clf._abc_impl
    @property
    def _estimator_type(self):              return self.clf._estimator_type
    @property
    def _check_feature_names(self):         return self.clf._check_feature_names
    @property
    def _check_n_features(self):            return self.clf._check_n_features
    @property
    def _get_param_names(self):             return self.clf._get_param_names
    @property
    def _get_tags(self):                    return self.clf._get_tags
    @property
    def _more_tags(self):                   return self.clf._more_tags
    @property
    def _prune_tree(self):                  return self.clf._prune_tree
    @property
    def _repr_html_(self):                  return self.clf._repr_html_
    @property
    def _repr_html_inner(self):             return self.clf._repr_html_inner
    @property
    def _repr_mimebundle_(self):            return self.clf._repr_mimebundle_
    @property
    def _validate_X_predict(self):          return self.clf._validate_X_predict
    @property
    def _validate_data(self):               return self.clf._validate_data
        
    def fit(self, x_train, y_train):
        self.clf = self.clf.fit(x_train, y_train)
        # https://ranvir.xyz/blog/practical-approach-to-tree-pruning-using-sklearn/
        # https://online.stat.psu.edu/stat508/lesson/11/11.8
        path = self.clf.cost_complexity_pruning_path(x_train, y_train)
        ccp_alphas, impurities = path.ccp_alphas, path.impurities

        n = len(ccp_alphas)
        clfs = []
        for ccp_alpha in ccp_alphas:
            clf = DecisionTreeClassifier(
                *self.args,
                random_state=0,
                ccp_alpha=ccp_alpha,
                **self.kwargs,
            )
            clf.fit(x_train, y_train)
            clfs.append(clf)
        sizes = [x.get_n_leaves() for x in clfs]  # num leaves
        scores = [
            err + alpha * L for err, alpha, L in zip(impurities, ccp_alphas, sizes)
        ]

        avgaccs = []
        from informative_iterator import ProgressBar
        for progress, ccp_alpha in ProgressBar(ccp_alphas, title="pruning"):
            accs = []
            kf = KFold(
                n_splits=10, shuffle=True
            )
            for (train_indexes, test_indexes) in kf.split(x_train):
                train_indexes, test_indexes = train_indexes.tolist(), list(
                    test_indexes
                )
                kf_xtrain, kf_ytrain = x_train[train_indexes], [
                    y_train[j] for j in train_indexes
                ]
                kf_xtest, kf_ytest = x_train[test_indexes], [
                    y_train[j] for j in test_indexes
                ]
                clf = DecisionTreeClassifier(
                    *self.args,
                    random_state=0,
                    ccp_alpha=ccp_alpha,
                    **self.kwargs,
                )
                kf_xtrain = kf_xtrain if not hasattr(kf_xtrain, "values") else kf_xtrain.values
                kf_ytrain = kf_ytrain if not hasattr(kf_ytrain, "values") else kf_ytrain.values
                kf_xtest = kf_xtest if not hasattr(kf_xtest, "values") else kf_xtest.values
                kf_ytest = kf_ytest if not hasattr(kf_ytest, "values") else kf_ytest.values
                clf.fit(kf_xtrain, kf_ytrain)
                pred = clf.predict(kf_xtest)
                
                
                if not self.kwargs.get("class_weight", False):
                    # use normal f1_score
                    from sklearn.metrics import confusion_matrix as confusion_matrix_function
                    (
                        (negative_guess_was_correct_count, positive_guess_was_wrong_count),
                        (negative_guess_was_wrong_count  , positive_guess_was_correct_count)
                    ) = confusion_matrix_function(kf_ytest, pred)
                    
                    total_accuracy    = (negative_guess_was_correct_count + positive_guess_was_correct_count)/ (negative_guess_was_correct_count + positive_guess_was_wrong_count + negative_guess_was_wrong_count + positive_guess_was_correct_count)
                    number_of_positive_guesses = (positive_guess_was_correct_count + positive_guess_was_wrong_count)
                    number_of_negative_guesses = (negative_guess_was_correct_count + negative_guess_was_wrong_count)
                    number_of_true_positives = (positive_guess_was_correct_count + negative_guess_was_wrong_count)
                    number_of_true_negatives = (negative_guess_was_correct_count + positive_guess_was_wrong_count)
                    guessing_positive_accuracy = positive_guess_was_correct_count/number_of_positive_guesses if number_of_positive_guesses != 0 else 0
                    guessing_negative_accuracy = negative_guess_was_correct_count/number_of_negative_guesses if number_of_negative_guesses != 0 else 0
                    true_positive_accuracy = positive_guess_was_correct_count/number_of_true_positives if number_of_true_positives != 0 else 0
                    true_negative_accuracy = negative_guess_was_correct_count/number_of_true_negatives if number_of_true_negatives != 0 else 0
                    number_of_false_positives_per_false_negative = positive_guess_was_wrong_count / negative_guess_was_wrong_count if negative_guess_was_wrong_count != 0 else float("inf")
                    number_of_false_negatives_per_false_positive = negative_guess_was_wrong_count / positive_guess_was_wrong_count if positive_guess_was_wrong_count != 0 else float("inf")
                    f1_score = 2 * (true_positive_accuracy * guessing_positive_accuracy) / (true_positive_accuracy + guessing_positive_accuracy) if 0 != (true_positive_accuracy + guessing_positive_accuracy) else 0
                    
                    acc = f1_score
                # weighted
                else:
                    class_index_for = {
                        key: index
                            for index, key in enumerate(self.clf.classes_)
                    }
                    y = [ class_index_for[x] for x in kf_ytest ]
                    p = [ class_index_for[x] for x in pred ]
                    # weighted F1
                    acc = sklearn.metrics.f1_score(
                        y,
                        p,
                        sample_weight=tuple(self.kwargs["class_weight"][y] for y in kf_ytest),
                    )
                accs.append(acc)
            avgacc = numpy.mean(accs)
            avgaccs.append(avgacc)

        bestacc = max(avgaccs)
        best_index = avgaccs.index(bestacc)
        self.clf = clfs[best_index]
        return self
    
    def predict(self, *args,**kwargs):
        return self.clf.predict(*args,**kwargs)
    
    def predict_proba(self, *args,**kwargs):
        return self.clf.predict_proba(*args,**kwargs)

def make_classifier():
    return PrunedDecisionTree(
        class_weight={
            False: 1,
            True: 10, # is_dng==True
        },
    )
    