# print_directory_tree.ps1
# Script to print the full directory tree of the current directory

# Set the output file path (will be created in the current directory)
$outputFile = "directory_tree.txt"

# Function to recursively print directory structure with indentation
function Print-DirectoryTree {
    param (
        [string]$path,
        [string]$indent = ""
    )
    
    # Get all items (files and folders) in the current path
    $items = Get-ChildItem -Path $path | Sort-Object -Property { $_.PSIsContainer } -Descending
    
    foreach ($item in $items) {
        # Print the current item (folder or file) with indentation
        Write-Output "$indent$item" | Out-File -FilePath $outputFile -Append
        
        # If the item is a directory, recurse into it with increased indentation
        if ($item.PSIsContainer) {
            Print-DirectoryTree -path $item.FullName -indent "$indent  "
        }
    }
}

# Clear the output file if it already exists
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# Print header to the output file
Write-Output "Directory Tree of $($PWD.Path)" | Out-File -FilePath $outputFile
Write-Output "Generated on $(Get-Date)" | Out-File -FilePath $outputFile
Write-Output "----------------------------------------" | Out-File -FilePath $outputFile

# Start printing the directory tree from the current directory
Print-DirectoryTree -path $PWD.Path

# Notify user that the tree has been generated
Write-Host "Directory tree has been saved to $outputFile"