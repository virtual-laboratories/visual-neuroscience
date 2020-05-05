# Neuroscience virtual laboratories

Virtual laboratories for teaching neurophysiology to undergraduate students. See them in action:
https://ilearn.med.monash.edu.au/physiology/Neurophysiology/visualNeuroscience.html

Read more about them here: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5105958/

## Setup
### Text editor 
Install your preferred text editor and any plugins, packages or themes you use. I used Atom from Github: https://atom.io/, with the following packages: 
1. Atom-alignment: https://atom.io/packages/atom-alignment
2. Busy-signal: https://atom.io/packages/busy-signal 
3. Emmet: https://atom.io/packages/emmet 
4. Intentions: https://atom.io/packages/intentions 
5. Linter: https://atom.io/packages/linter 
6. Linter-eslint: https://atom.io/packages/linter-eslint 
7. Linter-ui-default: https://atom.io/packages/linter-ui-default

### Automation 
Install node.js (version 5.11.0) and npm (version 3.8.6) globally. See here for instructions: https://nodejs.org/en/download/, here for the specific release: https://nodejs.org/download/release/v5.11.0/. 
1. Open command prompt. 
2. Install gulp (version 3.9.0) globally: > npm install --global gulp@3.9.0 
3. Install eslint globally: > npm install -g eslint 
4. Install Git: https://gitforwindows.org/

### Editing the simulation
1. Fork this repository
2. Install browser-sync: > npm install -g browser-sync 
3. Install gulp locally: navigate to project folder, > npm install --save-dev gulp@3.9.0 
4. In the command prompt, navigate to the folder that holds the simulation that you would like to edit and run: > gulp. This will open the simulation on your browser (localhost) and refresh every time you save a change, so that you see the effects as you make edits. 
5. When all edits have been done, push the changes to the repository and to the server: 
a. Exit gulp, and type: > gulp dist 
b. Open Git Bash, navigate to the folder and run: > git add . > git commit -m "Commit message" > git push 
c. Open the SCP, and open the relevant folders on both sides of the window (for the left, the version that is ready for distribution will be located in the ‘dist’ folder). Click ‘Synchronize’. Make sure any new files to be added have a checkmark. 
