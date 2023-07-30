package inputs

import (
	"fmt"
	"nemesisly/cdjs/utils"
	"os"
	"strings"

	"github.com/TwiN/go-color"
	"golang.org/x/exp/slices"
	"golang.org/x/term"
)

// ANSI ESCAPE CODES
// TODO: Switch to curses library for cursor positioning
var AEC = map[string]string{
	"UP":        "\033[A",
	"DOWN":      "\033[B",
	"CLEARLINE": "\033[2K",
	"TOGGLEVIS": "\033[28m",
}

func formatPromptString(prompt string, status int8, output string) string {
	// Value Table
	// -1: Error
	// 0: Neutral
	// 1: Complete
	fmt.Printf("%v", AEC["CLEARLINE"])
	switch status {
	case -1:
		return fmt.Sprintf("\r%[2]vX%[4]v %[1]v %[3]v⋅%[4]v %[2]v%[5]v%[4]v\n", color.With(color.Bold, prompt), color.Red, color.Black, color.Reset, output)
	case 0:
		return fmt.Sprintf("%[2]v?%[4]v %[1]v %[3]v⋅%[4]v %[5]v", color.With(color.Bold, prompt), color.Cyan, color.Black, color.Reset, output)
	case 1:
		return fmt.Sprintf("\r%[6]v✓%[4]v %[1]v %[3]v⋅%[4]v %[2]v%[5]v%[4]v\n", color.With(color.Bold, prompt), color.Green, color.Black, color.Reset, output, color.Cyan)
	default:
		return "Error"
	}
}

// Basic String Input
func StringInput(prompt string) string {
	var output string
	fmt.Printf("%v", formatPromptString(prompt, 0, ""))
	fmt.Scanf("%s", &output)
	if len(output) <= 0 {
		fmt.Printf("%[2]v %[1]s", formatPromptString(prompt, -1, output), AEC["UP"])
		return output
	}
	fmt.Printf("%[2]v %[1]s", formatPromptString(prompt, 1, output), AEC["UP"])
	return output
}

// TODO: Make right-arrow auto-complete
// String Input but with a placeholder value
func OpinionatedStringInput(prompt string, placeholder string) string {
	// Switch terminal modes
	oldState, err := term.MakeRaw(int(os.Stdin.Fd()))
	utils.HandleError(err)

	defer term.Restore(int(os.Stdin.Fd()), oldState)

	// Input buffer
	var inputBytes []byte = make([]byte, 3)

	// Output string slice
	var output []string
	output = append(output, string(inputBytes[0]))
	prettyOutput := strings.Join(output, "")
	var index int = 0

	// TODO: Persistent placeholder if characters match up
	// Function to update the OpinionatedStringInput prompt
	updateFormattedPrompt := func() {
		// prompt = fmt.Sprint(strings.Index(prettyOutput, placeholder))
		if len(output) <= 1 {
			fmt.Printf("\r%[1]s%[2]s", formatPromptString(prompt, 0, prettyOutput), fmt.Sprintf("%s\033[%vD", color.With(color.Black, placeholder), len(placeholder)))
		} else {
			fmt.Printf("\r%[1]s", formatPromptString(prompt, 0, prettyOutput))
		}
	}

	updateFormattedPrompt()

	for {
		os.Stdin.Read(inputBytes)
		// os.Stdin.Read(inputBytesBuffer)
		prettyOutput = strings.Join(output, "")
		currentInputString := string(inputBytes[0])

		// DEBUG using prompt:
		// prompt = fmt.Sprint(inputBytes)
		// updateFormattedPrompt()
		// Check for unicode letters
		if inputBytes[0] >= 33 && inputBytes[0] <= 126 {
			// Handle Typing Characters
			output = append(output, currentInputString)

			prettyOutput = strings.Join(output, "")
			index++
			updateFormattedPrompt()
		}

		// Handle Space
		if inputBytes[0] == 32 {
			output = append(output, " ")
			prettyOutput = strings.Join(output, "")
			index++
			updateFormattedPrompt()
		}

		// Handle Backspace and Delete
		if inputBytes[0] == 8 || inputBytes[0] == 127 {
			if len(output) > 0 {
				output = output[:len(output)-1]
				prettyOutput = strings.Join(output, "")
			}
			index--
			updateFormattedPrompt()
		}

		// Check For Ctrl-C and Ctrl-D
		if inputBytes[0] == 3 || inputBytes[0] == 4 {
			fmt.Print(formatPromptString(prompt, -1, prettyOutput))
			fmt.Print("\r")
			term.Restore(int(os.Stdin.Fd()), oldState)
			os.Exit(1)
		}

		// Check for return key
		if inputBytes[0] == 13 {
			if len(output) > 1 {
				fmt.Print(formatPromptString(prompt, 1, prettyOutput))
			} else {
				prettyOutput = placeholder
				fmt.Print(formatPromptString(prompt, 1, prettyOutput))
			}
			fmt.Print("\r")
			return prettyOutput
		}
	}
}

func BoolInput(prompt string, defaultInput bool) bool {
	// Switch terminal modes
	oldState, err := term.MakeRaw(int(os.Stdin.Fd()))
	utils.HandleError(err)
	prompt += color.With(color.Black, " (y\\N)")

	defer term.Restore(int(os.Stdin.Fd()), oldState)

	// Input buffer
	var inputBytes []byte = make([]byte, 1)

	updateBoolInput := func() {
		fmt.Printf("\r%[1]s%[2]s", formatPromptString(prompt, 0, ""), fmt.Sprintf("%s\033[%vD", color.With(color.Black, defaultInput), len(fmt.Sprint(defaultInput))))
	}

	updateBoolInput()
	for {
		os.Stdin.Read(inputBytes)
		updateBoolInput()
		// Handle Ctrl-C and Ctrl-D
		if inputBytes[0] == 3 || inputBytes[0] == 4 {
			fmt.Print(formatPromptString(prompt, -1, ""))
			term.Restore(int(os.Stdin.Fd()), oldState)
			os.Exit(1)
		}

		if inputBytes[0] == 121 || inputBytes[0] == 89 {
			fmt.Print(formatPromptString(prompt, 1, "true"))
			fmt.Print("\r")
			return true
		}

		if inputBytes[0] == 110 || inputBytes[0] == 78 {
			fmt.Print(formatPromptString(prompt, 1, "false"))
			fmt.Print("\r")
			return false
		}

		if inputBytes[0] == 13 {
			fmt.Print(formatPromptString(prompt, 1, fmt.Sprint(defaultInput)))
			fmt.Print("\r")
			return defaultInput
		}
	}
}

func PickerInput(prompt string, options []string) string {
	// Switch terminal modes
	oldState, err := term.MakeRaw(int(os.Stdin.Fd()))
	utils.HandleError(err)

	defer term.Restore(int(os.Stdin.Fd()), oldState)

	inputDown := []byte{27, 91, 66}
	inputUp := []byte{27, 91, 65}

	// Input buffer
	var inputBytes []byte = make([]byte, 3)

	index := 0
	// indexClamp := utils.ClampInt(index, 0, len(options))

	formatList := func() string {
		list := ""
		for i := 0; i < len(options); i++ {
			if index == i {
				list += fmt.Sprintf("%[2]s %[1]s\n\r", color.With(color.Cyan, color.With(color.Underline, options[i])), color.With(color.Cyan, color.With(color.Bold, "\u203A")))
			} else {
				list += fmt.Sprintf("  %s\n\r", options[i])
			}
		}
		return list
	}

	updatePickerInput := func() {
		fmt.Printf("%[1]s\n\r%[2]v\033[%[3]vA", formatPromptString(prompt, 0, color.With(color.Black, "...\033[3D")), formatList(), len(options)+1)
	}

	updatePickerInput()
	fmt.Print(AEC["TOGGLEVIS"])
	for {
		os.Stdin.Read(inputBytes)
		if slices.Compare(inputBytes, inputDown) == 0 || inputBytes[0] == 9 {
			if index < len(options)-1 {
				index++
			} else if index == len(options)-1 {
				index = 0
			}
			updatePickerInput()
		}
		if slices.Compare(inputBytes, inputUp) == 0 {
			if index > 0 {
				index--
			} else if index == 0 {
				index = len(options) - 1
			}
			updatePickerInput()
		}
		// Handle Ctrl-C and Ctrl-D
		if inputBytes[0] == 3 || inputBytes[0] == 4 {
			term.Restore(int(os.Stdin.Fd()), oldState)
			fmt.Print("\r")
			fmt.Print(AEC["TOGGLEVIS"])
			os.Exit(1)
		}

		if inputBytes[0] == 13 {
			fmt.Print(AEC["TOGGLEVIS"])
			fmt.Printf("%v", AEC["CLEARLINE"])
			fmt.Print(formatPromptString(prompt, 1, options[index]))
			fmt.Printf("\033[0J\r")
			return options[index]
		}
	}
}

func RunTest() {
	// output := OpinionatedStringInput("My Prompt", "@nemesisly")
	// fmt.Printf("output: %v\n", output)

	// output := StringInput("My Prompt")
	// fmt.Printf("output: %v\n", output)

	// output := BoolInput("Install deps?", false)
	// fmt.Printf("%v\n", output)
	// options := []string{"npm", "yarn", "pnpm"}
	// PickerInput("Test", options)
	// fmt.Printf("%v\n", output)
}
