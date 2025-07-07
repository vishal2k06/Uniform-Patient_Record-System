# Uniform Patient Record System

A database-centric healthcare information system designed using PostgreSQL for managing uniform patient records. The project focuses on structured storage, querying, and reporting of patient data, with Python used as a supplementary tool for data import/export and report generation.

## Features

- Relational database schema designed for patients, diagnoses, and treatments
- Normalized data structure for efficiency and integrity
- SQL queries for:
  - Patient summaries
  - Treatment histories
  - Statistical aggregation
- PostgreSQL used as the primary backend
- Optional Python integration for:
  - Importing CSV/Excel data into PostgreSQL
  - Exporting reports to Excel

## Database Structure

- `patients`: Stores patient demographic data
- `records`: Tracks treatments, visits, test results
- `doctors`, `departments`: Additional supporting tables (if applicable)

## Installation

### 1. Install PostgreSQL

  - Ensure PostgreSQL is installed and running. You can download it from:
    [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
  - Create a database named:  CREATE DATABASE patient_record_system;
### 2. Clone the Repositorky
  - git clone https://github.com/vishal2k06/Uniform-Patient_Record-System.git
  - cd Uniform-Patient_Record-System
### 3. SetUp the DataBase Schema
  Run the SQL setup file to create tables:
  - psql -U your_username -d patient_record_system -f schema.sql
### 4. Python Dependencies
  If you're using Python scripts to import/export data:
  - pandas
  - psycopg2
  - openpyxl
  - XlsxWriter
## Technologies Used
- PostgreSQL – Primary database
SQL – Data querying and manipulation
- Python – Scripting support
- Pandas – Data manipulation
- psycopg2 – PostgreSQL connectivity for Python
## Output
- Structured and queryable patient records
- SQL reports and summaries
- Excel reports (via Python)
## License

   - This project is licensed under the MIT License.

## Contact

  - Email: vishalmanokaran135@gmail.com
  - GitHub: https://github.com/vishal2k06
