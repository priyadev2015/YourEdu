import React, { useState } from 'react';

const CommonApp = () => {
  const [transcript, setTranscript] = useState('');
  const [courseDescriptions, setCourseDescriptions] = useState('');
  const [recLetterParent, setRecLetterParent] = useState('');
  const [recLetterOutside, setRecLetterOutside] = useState('');
  const [schoolPhilosophy, setSchoolPhilosophy] = useState('');

  const handleUpload = () => {
    // Handle the upload of all documents
    alert('Documents uploaded!');
  };

  return (
    <div>
      <h2>Common App</h2>

      <section>
        <h3>Transcript</h3>
        <textarea
          placeholder="Enter transcript details here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        ></textarea>
        <button onClick={() => alert('Transcript template downloaded!')}>Download Transcript Template</button>
      </section>

      <section>
        <h3>Course Descriptions</h3>
        <textarea
          placeholder="Enter course descriptions here..."
          value={courseDescriptions}
          onChange={(e) => setCourseDescriptions(e.target.value)}
        ></textarea>
        <button onClick={() => alert('Course descriptions auto-generated!')}>Auto-generate Course Descriptions</button>
      </section>

      <section>
        <h3>Grading Rubric</h3>
        <p>Standard Grading Rubric Provided.</p>
        <button onClick={() => alert('Grading rubric template downloaded!')}>Download Grading Rubric</button>
      </section>

      <section>
        <h3>Recommendation Letters</h3>
        <textarea
          placeholder="Enter parent's recommendation letter..."
          value={recLetterParent}
          onChange={(e) => setRecLetterParent(e.target.value)}
        ></textarea>
        <textarea
          placeholder="Enter outside recommendation letter..."
          value={recLetterOutside}
          onChange={(e) => setRecLetterOutside(e.target.value)}
        ></textarea>
      </section>

      <section>
        <h3>School Philosophy</h3>
        <textarea
          placeholder="Enter school philosophy..."
          value={schoolPhilosophy}
          onChange={(e) => setSchoolPhilosophy(e.target.value)}
        ></textarea>
      </section>

      <button onClick={handleUpload}>Upload All My Docs</button>
    </div>
  );
};

export default CommonApp;
