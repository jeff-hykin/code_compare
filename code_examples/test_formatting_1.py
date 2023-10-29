import ez_yaml
from sklearn.metrics import make_scorer

equal_accuracy_scorer = make_scorer(equal_accuracy, greater_is_better=True)


#
# formatting of floats
#
from slick_siphon import siphon


class Hi:
    def __init__(self, thing):
        pass



@siphon(when=lambda *l_args: isinstance(l_args[0], float), is_true_for=stringify)
def stringify(*args):
    global some_var
    size = 0
    thing = 11
    # smallest decimal possible without loosing accuracy
    while float(format(args[0], f".{size}f")) != args[0]:
        size += 1

    print("hi")
    thing.thingy = 10

    def inner():
        nonlocal size
        return size

    return format(args[0], f".{size}f")


# TODO: walrus


def save_with_snippet(df, path, limit=200):
    df.to_csv(path, sep="\\t", encoding="utf-8", index=False)
    try:
        first_serveral_lines = ""
        with open(path, "r") as the_file:
            for index, line in enumerate(the_file):
                first_serveral_lines += line
                if index > limit:
                    break
        *folders, name, extension = FS.path_pieces(path)
        with open(FS.join(*folders, name + ".snippet" + extension), "w") as the_file:
            the_file.write(first_serveral_lines)
    except Exception as error:
        print(f"error creating snippet: {error}")