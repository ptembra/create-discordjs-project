/*
Copyright © 2023 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"errors"
	"fmt"
	"nemesisly/cdjs/inputs"
	"path/filepath"

	"github.com/TwiN/go-color"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initializes your discordjs project",
	Args: func(cmd *cobra.Command, args []string) error {
		if len(args) < 1 {

			return errors.New(color.With(color.Red, "requires at least 1 arg"))
		}
		if len(filepath.Ext(args[0])) > 0 {
			return errors.New(color.With(color.Red, "invalid project name"))
		}
		return nil
	},
	Run: func(cmd *cobra.Command, args []string) {
		possiblePkgManagers := []string{"npm", "yarn"}

		// TODO: Decide if keeping template input or switching to picker
		inputs.OpinionatedStringInput("Please choose a template", "@nemesisly/javascript")
		inputs.PickerInput("Please choose a package manager", possiblePkgManagers)
		inputs.BoolInput("Do you want to initialize a git repo?", false)
		inputs.BoolInput("Do you want to install the default dependencies automatically?", false)
	},
}

func init() {
	rootCmd.AddCommand(initCmd)
	// Sets usage template to a custom usage template
	// TODO: Find better way to format colours
	initCmd.SetUsageTemplate(fmt.Sprintf(`Specify the project directory to initialize:
	%[1]v %[2]v %[3]v<project-directory>%[4]v

For example:
	%[1]v %[2]v %[3]vmy-awesome-bot%[3]v
`,
		color.With(color.Purple, rootCmd.Use), // %[1]v
		color.With(color.Blue, initCmd.Use),   // %[2]v
		color.Green,                           // %[3]v
		color.Reset,                           // %[4]v
	))
}
