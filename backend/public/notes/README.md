# Law of Contracts - PDF Notes Guide

## Overview
This directory contains PDF notes for the Law of Contracts subject. The backend server is configured to serve these files to students through the Legal Notes section.

## Required PDF Files

To complete the notes section, you need to add the following PDF files to this directory:

### Notes Files:
1. **Law Of Contracts 1-Anil K Nair.pdf** - Complete Law of Contracts notes by Anil K Nair
2. **Family Law 1-Anil K Nair.pdf** - Complete Family Law notes by Anil K Nair
3. **BNS ANIL K NAIR.pdf** - Bharatiya Nyaya Sanhita (BNS) notes by Anil K Nair
4. **Law of Torts-Anil K Nair.pdf** - Complete Law of Torts notes by Anil K Nair
5. **Legal Language & Legal Writing-Anil K Nair.pdf** - Legal Language and Legal Writing notes by Anil K Nair

### Previous Year Question Papers:
5. **Contracts_PYQ_2023.pdf** - 2023 Previous Year Paper
6. **Contracts_PYQ_2022.pdf** - 2022 Previous Year Paper

## How to Add PDF Files

### Option 1: Manual Upload
1. Place your PDF files in this directory: `backend/public/notes/`
2. Make sure the filenames match exactly as listed above (case-sensitive)
3. Restart the backend server if it's running

### Option 2: Using File Explorer
1. Navigate to: `c:\Users\altha\law-quiz-app\backend\public\notes\`
2. Copy your PDF files into this folder
3. Ensure filenames match the required names above

## File Naming Convention
- The filename should be exactly: `Law Of Contracts 1-Anil K Nair.pdf`
- Note: This filename contains spaces, which is acceptable
- Keep the .pdf extension

## Verification
After adding the file, you can verify it's accessible by:
1. Starting the backend server: `npm start` (from backend directory)
2. Opening a browser and navigating to:
   - `http://localhost:5000/public/notes/Law%20Of%20Contracts%201-Anil%20K%20Nair.pdf`
   - (Note: Spaces in URLs are encoded as %20)

## Current Files in Directory
- Constitutional_Law_1.pdf - [Present]
- Law Of Contracts 1-Anil K Nair.pdf - [Present]
- Family Law 1-Anil K Nair.pdf - [Present]
- BNS ANIL K NAIR.pdf - [Present]
- Law of Torts-Anil K Nair.pdf - [Present]
- Legal Language & Legal Writing-Anil K Nair.pdf - [Present]
- Contracts_PYQ_2023.pdf - [Present]
- Contracts_PYQ_2022.pdf - [Present]
- Family_Law_PYQ_2023.pdf - [Present]
- Crimes_PYQ_2023.pdf - [Present]
- Torts_PYQ_2023.pdf - [Present]
- Legal_Lang_PYQ_2023.pdf - [Present]

## Notes
- The server automatically serves files from this directory via the `/public` route
- PDF files should be properly formatted and readable
- File size should be reasonable for web delivery (recommended < 50MB per file)
- Make sure you have the rights to distribute these educational materials
