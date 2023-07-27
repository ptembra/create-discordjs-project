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

func PackageJSON() *json_struct {
	PACKAGE_JSON_PATH := "../package.json"
	content, err := ioutil.ReadFile(PACKAGE_JSON_PATH)
	if err != nil {
		fmt.Println(err)
	}

	var data *json_struct

	err = json.Unmarshal([]byte(string(content)), &data)
	if err != nil {
		fmt.Println(err)
	}
	return data
}

func CompareVersions() {

	newestVersion, err := exec.Command("npm", "info", *PackageJSON().Package_Name, "version").Output()
	if err != nil {
		fmt.Println(err)
	}
	currentVersion := *PackageJSON().Version

	v1, err := version.NewVersion(currentVersion)
	v2, err := version.NewVersion(string(newestVersion))

	if v1.LessThan(v2) {
		println("less")
	}

	switch v1.Compare(v2) {
	case -1:
		fmt.Println("Smaller")
		break

	case 0:
		fmt.Println("Equal")
		break
	case 1:
		fmt.Println("Larger")
		break
	}
}

func GetVersionString() string {
	return fmt.Sprintf("%v version: %v\n", *PackageJSON().Package_Name, color.With(color.Cyan, *PackageJSON().Version))
}
