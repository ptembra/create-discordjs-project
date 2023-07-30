package utils

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os/exec"

	"github.com/TwiN/go-color"
	"github.com/hashicorp/go-version"
)

type json_struct struct {
	Version      *string `json:"version"`
	Package_Name *string `json:"name"`
}

func ReadPackageJSON() *json_struct {
	PACKAGE_JSON_PATH := "../package.json"
	content, err := ioutil.ReadFile(PACKAGE_JSON_PATH)
	HandleError(err)

	var data *json_struct

	err = json.Unmarshal([]byte(string(content)), &data)
	HandleError(err)
	return data
}

func CompareVersions() {

	newestVersion, err := exec.Command("npm", "info", *ReadPackageJSON().Package_Name, "version").Output()
	HandleError(err)
	currentVersion := *ReadPackageJSON().Version

	v1, err := version.NewVersion(currentVersion)
	HandleError(err)

	v2, err := version.NewVersion(string(newestVersion))
	HandleError(err)

	switch v1.Compare(v2) {
	case -1:
		fmt.Println("Smaller")
	case 0:
		fmt.Println("Equal")
	case 1:
		fmt.Println("Larger")
	}
}

func GetVersionString() string {
	return fmt.Sprintf("%v version: %v\n", *ReadPackageJSON().Package_Name, color.With(color.Cyan, *ReadPackageJSON().Version))
}
