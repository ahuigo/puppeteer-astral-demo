main:
	deno run -A main.ts from=dev to=release/v0.29.0 msg='feat: select' repo=proj1
test_chrome:
	/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --remote-debugging-port=9222 --crash-dumps-dir=/tmp https://www.baidu.com

