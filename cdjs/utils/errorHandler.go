package utils

import (
	"fmt"

	"github.com/TwiN/go-color"
)

func HandleError(err error) {
	if err != nil {
		fmt.Println(color.With(color.Red, fmt.Sprintf("[Error]: %v", err)))
	}
}
