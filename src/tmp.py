class TextDiffHighlighter:

    def __init__(self):
        self.list1 = []
        self.list2 = []
        self.word_match_mode = True
        self.delimiters = "?! .,\"'/\\:;"

    def start_getting_input(self):
        print("Enter value for List 1:")
        self.list1 = self._get_list_input(1)

        print("\nEnter value for List 2:")
        self.list2 = self._get_list_input(2)

    def _get_list_input(self, list_number):
        items = []
        item = input(f"List {list_number}: ")
        if item == "":
            print("Please enter at least one character.")
        else:
            items.append(item)
        return items

    def highlight_differences(self):
        if not self.list1 or not self.list2:
            print("Error: Both lists must have value first!")
            return

        print("\n" + "=" * 60)
        print("COMPARING TWO LISTS")
        print("=" * 60)

        # Convert lists to single strings for comparison
        text1 = " ".join(self.list1)
        text2 = " ".join(self.list2)

        print(f"List 1: {text1}")

        if text1 == text2:
            print(f"List 2: {text2}")
            print("Result: LISTS ARE IDENTICAL ✓")
        else:
            print("Result: LISTS ARE DIFFERENT ✗")



def main():
    print("=" * 50)
    print("TEXTDIFF HIGHLIGHTER")
    print("Compare two lists of text items")
    print("=" * 50)

    # Create highlighter instance
    highlighter = TextDiffHighlighter()

    while True:
        print("\nOptions:")
        print("1. Enter lists manually")
        print("2. Compare and highlight differences")
        print("3. Exit")

        choice = input("\nEnter your choice (1-5): ")

        if choice == "1":
            highlighter.start_getting_input()

        elif choice == "2":
            pass

        elif choice == "3":
            print("Thank you for using TextDiff Highlighter!")
            break

        else:
            print("Invalid choice. Please try again.")


# Run the program
if __name__ == "__main__":
    main()