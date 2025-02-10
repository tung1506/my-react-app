import emailjs from 'emailjs-com';

// EmailJS Configuration
const SERVICE_ID = 'service_se7q2ae';
const USER_ID = 'FpX5vCICNCswaL2aW';

class EmailService {
  // Gửi email thông thường
  sendEmail(recipientEmail) {
    const TEMPLATE_ID = 'template_obl7jld';

    const templateParams = {
      to_email: recipientEmail,
    };

    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
      .then(response => {
        console.log('Email sent successfully:', response.status, response.text);
        return response;
      })
      .catch(error => {
        console.error('Failed to send email:', error);
        throw error;
      });
  }

  sendQnaResultsEmail(recipientEmail, answers) {
    const TEMPLATE_ID = 'template_onutont';

    // Chuẩn bị template params từ câu trả lời
    const templateParams = this.mapAnswersToTemplate(answers);

    templateParams.to_email = recipientEmail;
    console.log(templateParams)
    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID)
      .then(response => {
        console.log('QnA Email sent successfully:', response.status, response.text);
        return response;
      })
      .catch(error => {
        console.error('Failed to send QnA email:', error);
        throw error;
      });
  }

  // Chuẩn hóa câu trả lời từ mảng thành template params, ghép URL vào thẻ img nếu là link ảnh
  mapAnswersToTemplate(answers) {
    const templateData = {};
    answers.forEach((answer, index) => {
      const key = `question_${index + 1}`;
      if (!answer.startsWith('data:image')) {
        // Ghép URL vào thẻ <img>
        templateData[key] = answer || 'N/A';
      }
    });
    return templateData;
  }
}

export default new EmailService();
