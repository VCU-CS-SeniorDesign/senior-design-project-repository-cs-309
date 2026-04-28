**Code Documentation**

**Files**
* ai-recommendor-app
  * .next - npm folder.
  * app
    * api
      * chat
        * route.ts - responsible for connecting with the generative AI, providing the prompt and other information, and returning the response.
    * assets - image and background files.
    * components - frontend components; including for the bubble animation and the ability for clickable preset questions/scenarios.
    * documents - PDF files converted into HTML files through an online tool (https://cloudconvert.com/pdf-to-html); the files are used by loadDb.ts to seed the database.
    * global.css - responsible for styling of the tool.
    * layout.tsx - responsible for applying styling and putting all the components into an HTML page.
    * page.tsx - responsible for getting the user's input in various fields and passing it all to route.ts to handle. 
  * node_modules - npm folder.
  * scripts
    * loadDb.ts - responsible for the seeding process (npm run seed), which scans the documents/files linked in the file, converts their contents into vector embeddings, and puts them into the database.
  * .env - needs to include a database (ASTRA_DB_NAMESPACE, ASTRA_DB_COLLECTION, ASTRA_DB_API_ENDPOINT, and ASTRA_DB_APPLICATION_TOKEN) and an AI key (GOOGLE_GENERATIVE_AI_API_KEY).
  * other files - npm related.
* old-potential-design - design that ended up not being used.
  * ApiHandler.java - handles API calls; server backend.
  * index.html - tool's frontend.
  * Main.java - handles contexts/routing.

**Database and AI**
For our database, we used an Astra database (https://astra.datastax.com/) with 3072 dimensions and a cosine similarity metric, through AWS. For our two AI models, we used Google AI Studio; using the API key we created there, we were able to use gemini-embedding-001 for creating embeddings (both for the database and for the user prompt we were comparing to embeddings in the database) and gemini-2.5-flash-lite (the generative AI model).

**Adding Documents**
In order to add documents to the database, make sure they are HTML. Then, add a link to the HTML site OR HTML file in repo to loadDb.ts.

If the program is to be used in real scenarios, the code should be adjusted to regularly pull data from websites like OFAC, as well as to OCR any PDFs that are pulled to ensure semantics are kept (such as for tables); currently, the PDFs are run through messy PDF-to-HTML converters online, resulting in messy HTML tagging.

**Running the Code**
Run “npm run seed” to add documents to the database (assuming you have set up your database). Make sure to commend out documents you have previously added, otherwise you will add duplicates; code was added to hopefully prevent duplicates though.

To run the actual tool after documents have been added, run “npm run dev”.

Note: "npm run" commands should be run while in the ai-recommendor-app directory