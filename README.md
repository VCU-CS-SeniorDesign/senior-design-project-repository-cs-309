![Alt text](CS26-309_SpringPoster.png)

# CS-309 AI Recommender Tool  
### Course/Term: CMSC-451, Fall 2025 - Spring 2026
### Members: Jake Carduck, Michelle Koh, Kelly Hwangpo, Dylan Tran
### CS Advisor: Dr. Budwell, Ph.D., Dr. Leonard, Ph.D.
### Sponsor: Lakshmi Narayana Rasalay, Nabin Debnath, Capital One

# Project Summary
- This AI Risk Recommender Tool is a single-page web application designed to help users quickly assess and manage potential risks. 
- Providing several inputs, for example - risk title, risk description, impacted areas, number of controls and their descriptions to mitigate the risk, numerical values for probability, control effectiveness etc., the tool calculates an adjusted risk score.
- Categorizes the risk of input as High, Medium, or Low, providing a clear risk level and a set of actionable recommendations based on the assessment.
- This interactive tool simplifies a key part of the risk management process, turning complex analysis into a straightforward, guided experience.

# Objective
- Help users quickly assess and manage potential risks
- Calculates an adjusted risk score based on user input
- Categorize the risk as high, medium, or low
- Provides a clear risk level and a set of actionable recommendations based on the assessment

# Problem: 
- All companies rely on a government, risk, and compliance (GRC) assessment for new job roles, projects, etc.
- The current process is:
  - Time consuming
  - Manual 
  - Complex 
  - Lacks scalability

# Goal
- Simplify the risk management process, turning complex analysis into a straightforward, guided experience.

# Al Logic Under Development:
- Designing and testing an Al model that applies machine learning to analyze data, identify patterns, and find efficient solutions.
- Aim to continuously improve through experience to make risk assessment faster, smarter, and reliable.

# Addressing GRC:
- Emphasize governance, risk, and compliance ensures accountability in industrial industries.

# Technical Design Implementation: 
- Document-driven RAG system (organization inputs documents) 
- Cleans + normalizes text (PDF/Doc/etc.)
- Splits the text into chunks Generates embeddings for each chunk
- Stores embeddings + metadata in a vector database User inputs query → converts to an embedding
- Retrieves relevant chunks from vector database
- Builds context with the chunk selection LLM generates the answer using that context
- Responds with document references/citations

# Impact:
- Automates risk assessment process for faster, more consistent results
- Improves efficiency and accuracy across risk evaluations
- Supports government, risk, and compliance standards
- Enhances decision-making using reliable, data-driven recommendations for risk mitigations.
- Offers a user-friendly interface that simplifies the task
- Speeds up the overall assessment and mitigation overflow
- Uses machine learning to evolve and refine recommendations as more data becomes available
  
# Tools
- Docker
- PyTorch

# Languages
- Java
- Javascript
- HTML
- Typescript

# Project Documents
- GoogleDriveFiles.zip - all files from our project's Google Drive.
- ./Code/README.md - documentation regarding the files in the Code directory and how to seed and run the tool.

# Challenges Faced:
Time management 
	- Scheduling and team coordination 
Finding the documents 
	- Reliability 
	- Accuracy 
	- What documents can be used to indirectly train the AI for testing (since actual GRC data is proprietary)? 
Finding and running the right AI 
	- Most offer few free tokens
	- Running the initial AI setup takes several minutes 	with our hardware and open-source AI for just a few documents
