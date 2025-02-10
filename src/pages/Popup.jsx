import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Heart } from 'lucide-react';
import './Popup.css';

const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: 'easeIn' } }
};

const Popup = ({ message, onAction }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="popup-overlay"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={popupVariants}
            >
                <div className="popup-card">
                    <Heart className="popup-icon" />
                    <h2 className="popup-message">{message}</h2>
                    <div className="popup-actions">
                        <Button className="popup-button" onClick={() => onAction('yes')}>
                            Yes 💕
                        </Button>
                        <Button className="popup-button" onClick={() => onAction('no')}>
                            No 😢
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default Popup;
