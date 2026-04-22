{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    inputs:
    inputs.flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import inputs.nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        # Android SDK configuration - we'll copy this to a mutable location
        androidComposition = pkgs.androidenv.composeAndroidPackages {
          buildToolsVersions = [ "34.0.0" "35.0.0" "36.0.0" ];
          platformVersions = [ "34" "35" "36" ];
          abiVersions = [ "arm64-v8a" "x86_64" ];
          includeNDK = true;
          ndkVersions = [ "27.1.12297006" ];
          includeSystemImages = false;
          includeEmulator = false;
          includeSources = false;
          extraLicenses = [
            "android-googletv-license"
            "android-sdk-arm-dbt-license"
            "android-sdk-license"
            "android-sdk-preview-license"
            "google-gdk-license"
            "intel-android-extra-license"
            "intel-android-sysimage-license"
            "mips-android-sysimage-license"
          ];
        };

        androidSdk = androidComposition.androidsdk;

        # Script to set up mutable Android SDK
        setupAndroidSdk = pkgs.writeShellScriptBin "setup-android-sdk" ''
          ANDROID_SDK_DIR="$HOME/.android-sdk-breathe"

          if [ ! -d "$ANDROID_SDK_DIR" ]; then
            echo "Setting up mutable Android SDK at $ANDROID_SDK_DIR..."
            mkdir -p "$ANDROID_SDK_DIR"
            cp -r ${androidSdk}/libexec/android-sdk/* "$ANDROID_SDK_DIR/"
            chmod -R u+w "$ANDROID_SDK_DIR"
            echo "Android SDK setup complete!"
          else
            echo "Android SDK already exists at $ANDROID_SDK_DIR"
          fi

          echo "$ANDROID_SDK_DIR"
        '';
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            pkgs.nodejs
            pkgs.pnpm_10
            pkgs.jdk17
            setupAndroidSdk
          ];

          JAVA_HOME = "${pkgs.jdk17}";

          shellHook = ''
            # Set up mutable Android SDK
            ANDROID_SDK_DIR="$HOME/.android-sdk-breathe"

            if [ ! -d "$ANDROID_SDK_DIR" ]; then
              echo "First time setup: copying Android SDK to mutable location..."
              mkdir -p "$ANDROID_SDK_DIR"
              cp -r ${androidSdk}/libexec/android-sdk/* "$ANDROID_SDK_DIR/"
              chmod -R u+w "$ANDROID_SDK_DIR"
              echo "Done!"
            fi

            export ANDROID_HOME="$ANDROID_SDK_DIR"
            export ANDROID_SDK_ROOT="$ANDROID_SDK_DIR"
            export ANDROID_NDK_HOME="$ANDROID_SDK_DIR/ndk/27.1.12297006"
            export ANDROID_NDK_ROOT="$ANDROID_SDK_DIR/ndk/27.1.12297006"
            export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

            # Create local.properties for Android project
            # Note: Only sdk.dir is set; ndk.dir is deprecated and NDK is found via ANDROID_NDK_HOME env var
            if [ -d "android" ]; then
              echo "sdk.dir=$ANDROID_HOME" > android/local.properties
            fi

            echo ""
            echo "=== Android Development Environment ==="
            echo "ANDROID_HOME: $ANDROID_HOME"
            echo "ANDROID_NDK_HOME: $ANDROID_NDK_HOME"
            echo "JAVA_HOME: $JAVA_HOME"
            echo "Java: $(java -version 2>&1 | head -1)"
            echo "======================================="
          '';
        };
      }
    );
}
