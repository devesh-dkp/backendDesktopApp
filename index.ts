// index.ts
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';

const port = 5000;
const app = express();
app.use(bodyParser.json());

interface Submission {
  name: string;
  email: string;
  phone: string;
  githubLink: string;
  stopwatchTime: number;
}

let submissions: Submission[] = [];

// Load submissions from JSON file
const loadSubmissions = () => {
  if (fs.existsSync('db.json')) {
    const data = fs.readFileSync('db.json', 'utf8');
    submissions = JSON.parse(data);
  }
};

// Save submissions to JSON file
const saveSubmissions = () => {
  fs.writeFileSync('db.json', JSON.stringify(submissions, null, 2));
};

loadSubmissions();

app.get('/ping', (req, res) => {
  res.json(true);
});

app.post('/submit', (req, res) => {
  const { name, email, phone, github_link, stopwatch_time } = req.body;
  const submission: Submission = {
    name,
    email,
    phone,
    githubLink: github_link,
    stopwatchTime: stopwatch_time,
  };
  submissions.push(submission);
  saveSubmissions();
  res.json(submission);
});

app.get('/read', (req, res) => {
  const index = Number(req.query.index);
  if (index < 0 || index >= submissions.length) {
    res.status(404).json({ message: 'Submission not found' });
  } else {
    res.json(submissions[index]);
  }
});

app.get('/count', (req, res) => {
  res.json(submissions.length);
});

app.delete('/delete', (req, res) => {
  const index = Number(req.query.index);
  if (index < 0 || index >= submissions.length) {
    res.status(404).json({ message: 'Submission not found' });
  } else {
    submissions.splice(index, 1);
    saveSubmissions();
    res.json({ message: 'Submission deleted successfully' });
  }
});

// New endpoint to search submissions by email
app.get('/search', (req, res) => {
  const email = req.query.email as string;
  const results = submissions.filter(submission => submission.email === email);
  if (results.length > 0) {
    res.json(results);
  } else {
    res.status(404).json({ message: 'No submissions found for this email' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
