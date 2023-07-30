package utils

import (
	"fmt"
	"os"

	"github.com/TwiN/go-color"
)

func HandleError(err error) {
	if err != nil {
		fmt.Printf("%v\n", color.With(color.Red, fmt.Sprintf("[Error]: %v", err)))
		os.Exit(1)
	}
}
