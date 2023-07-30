/*
Copyright © 2023 Nemesisly
*/
package cmd

import (
	"fmt"
	"nemesisly/cdjs/utils"
	"os"

	"github.com/TwiN/go-color"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "cdjs",
	Short: "Skip the annoying steps of setting up your environment and go straight to coding.",
	Long: color.With(color.Green, `cdjs is a CLI that supercharges your development of DiscordJS bots.
This application removes the need for extensive annoying boilerplates, allowing you to go straight to coding.`),
	Version: fmt.Sprintf("%v", *utils.ReadPackageJSON().Version),
	// Uncomment the following line if your bare application
	// has an action associated with it:
	Run: func(cmd *cobra.Command, args []string) {
		cmd.Root().Help()
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Hide Completion Command
	rootCmd.CompletionOptions.HiddenDefaultCmd = true

	// Setup Version Flag
	rootCmd.InitDefaultVersionFlag()
	rootCmd.SetVersionTemplate(utils.GetVersionString())
}
