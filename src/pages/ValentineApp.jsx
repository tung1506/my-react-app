import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from '../components/ui/button';
import { Heart, Gift, Sparkles, CheckCircle, Trash2 } from 'lucide-react';
import './ValentineApp.css';
import 'react-toastify/dist/ReactToastify.css';
import './toastStyles.css';
import EmailService from '../services/EmailService'
import Popup from './Popup.jsx'

const pageVariants = {
    initial: (direction) => ({
        opacity: 0,
        x: direction > 0 ? 100 : -100
    }),
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: (direction) => ({
        opacity: 0,
        x: direction > 0 ? -100 : 100,
        transition: { duration: 0.4, ease: 'easeIn' }
    })
};

const questions = [
    {
        id: 1,
        text: "Những lí do nào khiến em yêu anh ?",
        options: ["Đẹp trai", "Chim to", "Tinh tế", "Chiều vợ", "Nhẹ nhàng", "Cute đáng yêu", "Hút cỏ khỏe"],
        placeholder: "Lí do khác..."
    },
    {
        id: 2,
        text: "Valentine này em muốn được thưởng thức đặc sản nào ?",
        options: ["Sushi", "Nướng lẩu", "Beef Steak", "Đồ Âu", "Hút cỏ (must have)"],
        placeholder: "Đặc sản khác..."
    },
    {
        id: 3,
        text: "Sau 14 tháng yêu nhau, em muốn anh cải thiện điều gì để tình yêu của mình beautiful hơn nữa ?",
        type: "text-only",
        placeholder: "Hãy chia sẻ cảm nhận của em..."
    },
    {
        id: 4,
        text: "Chọn 2 bức ảnh của chúng mình em yêu thích nhất ❤️",
        type: "image-upload",
        requiresImageUpload: true,
    },
    {
        id: 5,
        text: "Email của em là gì?",
        type: "text-only",
        placeholder: "Nhập email của em..."
    }

];

const ValentineApp = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState(() => {
        const savedAnswers = localStorage.getItem('valentine_answers');
        return savedAnswers ? JSON.parse(savedAnswers) : [];
    });
    const [textAnswers, setTextAnswers] = useState(() => {
        const savedTextAnswers = localStorage.getItem('valentine_text_answers');
        return savedTextAnswers ? JSON.parse(savedTextAnswers) : {};
    });

    const [uploadedImages, setUploadedImages] = useState(() => {
        const savedImages = localStorage.getItem('valentine_images');
        return savedImages ? JSON.parse(savedImages) : ["", ""];
    });

    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        setDirection(1);
        if (step === 5) {
            setShowPopup(true);
        }
        else if (step <= questions.length) setStep(step + 1);
    };

    const handleBack = () => {
        setDirection(-1);
        if (step > 0) setStep(step - 1);
    };

    const handleYes = () => {
        setShowPopup(false);
        setStep(step + 1);
    };

    const handleNo = () => {
        toast.error(
            <>
                <Heart className="toast-icon" /> Em phải chọn yes, thử lại đi ❤️
            </>,
            {
                position: "top-center",
                className: "toast-custom",
                autoClose: 3000,
            }
        );
    };

    // Select answer and save to local storage
    const handleSelectAnswer = (questionId, option) => {
        const updatedAnswers = selectedAnswers.slice();
        const currentAnswers = updatedAnswers[questionId - 1] || [];

        if (currentAnswers.includes(option)) {
            updatedAnswers[questionId - 1] = currentAnswers.filter(ans => ans !== option);
        } else {
            updatedAnswers[questionId - 1] = [...currentAnswers, option];
        }

        setSelectedAnswers(updatedAnswers);
        localStorage.setItem('valentine_answers', JSON.stringify(updatedAnswers));
    };

    const handleSelectAnswerWithToast = (questionId, option) => {
        if (option === "Hút cỏ (must have)" && selectedAnswers[questionId - 1]?.includes(option)) {
            toast.error(
                <>
                    <Heart className="toast-icon" /> Em không thể bỏ hút cỏ cùng anh 🍃
                </>,
                {
                    position: "top-center",
                    className: "toast-custom",
                    autoClose: 3000,
                }
            );
            return;
        }
        handleSelectAnswer(questionId, option);
    };

    useEffect(() => {
        if (step === 2 && !selectedAnswers[1]?.includes("Hút cỏ (must have)")) {
            handleSelectAnswer(2, "Hút cỏ (must have)");
        }
    }, [step]);

    // Handle Text Answer
    const handleTextAnswer = (questionId, text) => {
        const updatedTextAnswers = { ...textAnswers, [questionId]: text };
        setTextAnswers(updatedTextAnswers);
        localStorage.setItem('valentine_text_answers', JSON.stringify(updatedTextAnswers));

        if (questionId === 5) {
            setEmail(text);
        }
    };

    // Handle Image Upload
    const handleImageUpload = (index, event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const updatedImages = [...uploadedImages];
                updatedImages[index] = reader.result;
                setUploadedImages(updatedImages);
                localStorage.setItem('valentine_images', JSON.stringify(updatedImages));
            };
            reader.readAsDataURL(file);
        }
    };

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleSendEmail = async () => {
        if (!isValidEmail(email)) {
            toast.error("Vui lòng nhập email hợp lệ!", {
                position: "top-center",
                className: "toast-custom",
                autoClose: 3000,
            });
            return;
        }

        const answersPayload = {
            email,
            answers: [
                ...(Array.isArray(selectedAnswers) ? selectedAnswers : []),
                ...(Array.isArray(textAnswers) ? textAnswers : []),
                ...(Array.isArray(uploadedImages) ? uploadedImages : [])
            ]
        };

        try {
            // Gọi sendEmail trước
            await EmailService.sendEmail(answersPayload.email);

            // Chuẩn hóa mảng câu trả lời để gửi cho QnA Email
            const combinedAnswers = [
                ...(answersPayload.answers || []),
                ...(answersPayload.textAnswers || []),
                ...(answersPayload.uploadedImages || [])
            ];

            // await EmailService.sendQnaResultsEmail(combinedAnswers);

            // Hiển thị thông báo thành công
            toast.success(
                <>
                    <CheckCircle className="toast-icon" /> Gửi email thành công! 🎉
                </>,
                {
                    position: "top-center",
                    className: "toast-custom",
                    autoClose: 3000,
                }
            );
        } catch (error) {
            console.log(error)
            // Hiển thị thông báo thất bại
            toast.error(
                <>
                    <Heart className="toast-icon" /> Gửi email thất bại! Vui lòng thử lại.
                </>,
                {
                    position: "top-center",
                    className: "toast-custom",
                    autoClose: 3000,
                }
            );
        }
    };


    const handlePopupAction = (response) => {
        if (response === 'yes') {
            toast.success(
                <>
                    <Sparkles className="toast-icon" /> Em đồng ý rồi nè! 💕
                </>,
                {
                    position: "top-center",
                    className: "toast-custom",
                    autoClose: 3000,
                }
            );
            setShowPopup(false);
            setStep(questions.length + 1); // Proceed to thank-you page or completion state
        } else {
            toast.error(
                <>
                    <Heart className="toast-icon" /> Em phải đồng ý chứ! Thử lại nhé ❤️
                </>,
                {
                    position: "top-center",
                    className: "toast-custom",
                    autoClose: 3000,
                }
            );
        }
    };


    const handleDeleteImage = (index) => {
        const updatedImages = [...uploadedImages];
        updatedImages[index] = "";

        // Clear input file
        const fileInput = document.querySelectorAll(`.image-preview-wrapper input[type="file"]`)[index];
        if (fileInput) {
            fileInput.value = null;
        }

        setUploadedImages(updatedImages);
        localStorage.setItem('valentine_images', JSON.stringify(updatedImages));
    };

    return (
        <div className="app-container">
            {/* Toast Container */}
            <ToastContainer />

            {/* Header */}
            <header className="header-container">
                <h1 className="header-title">
                    <Heart className="header-icon" />
                    Valentine Invitation
                </h1>
            </header>

            {/* Main Content */}
            <main className="content-container">
                {showPopup && <Popup onAction={handlePopupAction} message="Would you be my Valentine? 💖" />}
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="question-container"
                    >
                        {step === 0 ? (
                            <div className="content-card">
                                <Gift className="gift-icon" />
                                <p className="content-text">
                                    Cảm ơn Nho Xinh 🍇, người yêu tuyệt vời nhất trên đời của anh! ❤️
                                    Đây là món quà đặc biệt mà anh muốn gửi tặng vợ!
                                </p>
                            </div>
                        ) : step <= questions.length ? (
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="question-card"
                            >
                                <p className="question-text">{questions[step - 1].text}</p>

                                {/* Điều kiện hiển thị box upload */}
                                {questions[step - 1].requiresImageUpload && (
                                    <div className="image-upload-container">
                                        {uploadedImages.map((image, index) => (
                                            <div className="image-preview-wrapper" key={index}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(event) => handleImageUpload(index, event)}
                                                />
                                                {image && (
                                                    <div className="image-preview">
                                                        <img src={image} alt={`Uploaded ${index + 1}`} />
                                                        <Trash2
                                                            className="delete-icon"
                                                            onClick={() => handleDeleteImage(index)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="options-container">
                                    {questions[step - 1].options?.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            className={`option-button ${selectedAnswers[step - 1]?.includes(option) ? "selected" : ""
                                                }`}
                                            onClick={() => handleSelectAnswerWithToast(step, option)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {selectedAnswers[step - 1]?.includes(option) && (
                                                <CheckCircle className="selected-icon" />
                                            )}
                                            {option}
                                        </motion.button>
                                    ))}
                                    {questions[step - 1].placeholder && (
                                        <textarea
                                            className="text-input"
                                            placeholder={questions[step - 1].placeholder}
                                            value={textAnswers[step] || ""}
                                            onChange={(e) => handleTextAnswer(step, e.target.value)}
                                        />
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="thank-you-card"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="thank-you-content">
                                    <Sparkles className="sparkles-icon" />
                                    <p className="thank-you-text">Cảm ơn Nho Xinh 🍇 đã hoàn thành tất cả câu hỏi! 🎉</p>
                                    <p className="thank-you-message">
                                        Anh yêu vợ rất nhiều! ❤️ Thiệp mời đã được gửi về mail vợ, vợ mở mail check nhé.
                                    </p>
                                    <motion.img
                                        src="/images/heart.gif"
                                        alt="Heart Animation"
                                        className="thank-you-image"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>



            </main>

            {/* Footer Buttons */}
            <div className="button-container">
                {step > 0 && step <= questions.length && (
                    <Button onClick={handleBack} className="back-button">
                        Back
                    </Button>
                )}

                {/* Điều kiện hiển thị nút Next */}
                {step <= questions.length && (
                    <Button onClick={handleNext} className="next-button">
                        Next
                    </Button>
                )}

                {step === questions.length + 1 && (
                    <Button onClick={handleSendEmail} className="send-button">
                        Gửi Email Valentine 🎁
                    </Button>
                )}
            </div>

            {/* Footer */}
            <footer className="footer-container">
                <p className="footer-text">Made with ❤️ by someone who truly appreciates you.</p>
            </footer>
        </div>
    );
};

export default ValentineApp;
