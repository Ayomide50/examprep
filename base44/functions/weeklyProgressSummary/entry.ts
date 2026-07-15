import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all student profiles
    const students = await base44.asServiceRole.entities.StudentProfile.list("-created_date", 500);

    // Get Gmail access token
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gmail');

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let emailsSent = 0;
    let skipped = 0;
    let errors = 0;

    for (const student of students) {
      if (!student.email) {
        skipped++;
        continue;
      }

      try {
        // Get recent mock exam results
        const examResults = await base44.asServiceRole.entities.MockExamResult.filter(
          { user_id: student.user_id }, "-created_date", 50
        );
        const recentExams = examResults.filter(r => new Date(r.created_date) >= oneWeekAgo);

        // Get recent practice sessions
        const practiceSessions = await base44.asServiceRole.entities.PracticeSession.filter(
          { user_id: student.user_id }, "-created_date", 50
        );
        const recentSessions = practiceSessions.filter(r => new Date(r.created_date) >= oneWeekAgo);

        // Get recent practice attempts
        const practiceAttempts = await base44.asServiceRole.entities.PracticeAttempt.filter(
          { user_id: student.user_id }, "-created_date", 50
        );
        const recentAttempts = practiceAttempts.filter(r => new Date(r.created_date) >= oneWeekAgo);

        // Skip students with no activity in the past week
        if (recentExams.length === 0 && recentSessions.length === 0 && recentAttempts.length === 0) {
          skipped++;
          continue;
        }

        // Calculate stats
        const totalQuestions = recentAttempts.length;
        const correctAnswers = recentAttempts.filter(a => a.is_correct).length;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const avgExamScore = recentExams.length > 0
          ? Math.round(recentExams.reduce((sum, e) => sum + (e.score_percentage || 0), 0) / recentExams.length)
          : null;

        // Build email HTML
        const examList = recentExams.slice(0, 5).map(e =>
          `<li>${e.course_code || 'Course'}: ${Math.round(e.score_percentage)}% - ${e.passed ? 'Passed' : 'Not Passed'}</li>`
        ).join('');

        const htmlBody = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
<h2 style="color:#4f46e5">Weekly Progress Summary</h2>
<p>Hi ${student.full_name || "Student"},</p>
<p>Here is your progress summary for the past week:</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0">
<tr><td style="padding:8px;border-bottom:1px solid #eee">Questions Answered</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${totalQuestions}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee">Correct Answers</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${correctAnswers}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee">Accuracy</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${accuracy}%</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee">Mock Exams Taken</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${recentExams.length}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee">Practice Sessions</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${recentSessions.length}</td></tr>
${avgExamScore !== null ? `<tr><td style="padding:8px;border-bottom:1px solid #eee">Average Exam Score</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">${avgExamScore}%</td></tr>` : ''}
</table>
${recentExams.length > 0 ? `<h3 style="color:#4f46e5">Recent Mock Exams</h3><ul>${examList}</ul>` : ''}
<p style="margin-top:30px;color:#666">Keep up the great work! Log in to continue practicing.</p>
</div>`;

        // Construct RFC 2822 email
        const rawEmail = [
          `To: ${student.email}`,
          `Subject: Your Weekly Progress Summary - ExamPrep CBT`,
          `Content-Type: text/html; charset=UTF-8`,
          ``,
          htmlBody
        ].join("\r\n");

        // Base64 encode (URL-safe, UTF-8 safe)
        const bytes = new TextEncoder().encode(rawEmail);
        let binary = '';
        for (const b of bytes) {
          binary += String.fromCharCode(b);
        }
        const encodedEmail = btoa(binary)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        // Send via Gmail API
        const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: encodedEmail })
        });

        if (response.ok) {
          emailsSent++;
        } else {
          errors++;
        }
      } catch (err) {
        errors++;
      }
    }

    return Response.json({
      success: true,
      emailsSent,
      skipped,
      errors,
      totalStudents: students.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});