/*
Copyright © 2023 NAME HERE @Nemesisly
*/
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:    "version",
	Hidden: true,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Print(cmd.VersionTemplate())
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
