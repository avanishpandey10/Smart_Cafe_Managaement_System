If the project does not run:-
#Frontend command(react)
- Remove-Item -Recurse -Force node_modules
- Remove-Item package-lock.json
- npm install

#Backend command(node)
- rmdir /s /q node_modules
- del package-lock.json
- npm install

#Database(mongo)
-run seed.js folder locally after running the server once