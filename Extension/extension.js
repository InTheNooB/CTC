const vscode = require('vscode');
const http = require('http')
const { exec } = require('child_process');

const terminal = vscode.window.createOutputChannel('CTC')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    let disposable = vscode.commands.registerCommand('CTC.toCarbon', function() {
        terminal.clear();

        // Get the selected text
        let activeTextEditor = vscode.window.activeTextEditor;
        let extension = activeTextEditor.document.fileName.split('.').pop().toLowerCase();
        let selectedText = activeTextEditor.document.getText(new vscode.Range(activeTextEditor.selections[0].start, activeTextEditor.selections[0].end));
        terminal.appendLine("[📄] Copying selected text ...")
        selectedText = encodeURIComponent(selectedText);

        // Then send the code to the server
        const options = {
            hostname: '195.15.240.106',
            port: 3000,
            path: `/?extension=${extension}&code=${selectedText}`,
            method: 'GET'
        }

        const req = http.request(options, res => {

            // Retrieve URL from the server
            res.on('data', imageURL => {
                // Copies image to clipboard via a powershell script
                const copyToClipboardScript = `[Reflection.Assembly]::LoadWithPartialName('System.Drawing');
                [Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms');
        
                $filename = "temp.png";
                Invoke-WebRequest -Uri "${imageURL}" -OutFile $filename
        
                $file = get-item($filename);
                $img = [System.Drawing.Image]::Fromfile($file);
                [System.Windows.Forms.Clipboard]::SetImage($img);
                $img.Dispose()`;
                exec(copyToClipboardScript, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                    // do whatever with stdout
                    terminal.appendLine("[🖨️] DONE ! Image copied to clipboard");
                })
            })
        })

        req.on('error', error => {
            console.error(error)
            terminal.appendLine(error.message);
        })
        req.end()
        terminal.show();

    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}