import React from 'react';
import { Link } from 'react-router-dom';

const teamMembers = [
    { name: 'James Patel', role: 'Full Stack & Database' },
    { name: 'Megh Patel', role: 'System Design' },
    { name: 'Kris Patel', role: 'Backend & Database' },
    { name: 'Darshan Patel', role: 'Frontend' }
];

function Credits() {
    return (
        <div className="credits-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                .credits-page {
                    background-color: #F9FAFB; /* Changed to light background */
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Poppins', sans-serif;
                    color: #111827; /* Changed to dark text */
                    padding: 2rem;
                    overflow: hidden;
                }
                .credits-header {
                    text-align: center;
                    margin-bottom: 4rem;
                }
                .credits-header h1 {
                    font-size: 3rem;
                    font-weight: 700;
                    background: linear-gradient(45deg, #4F46E5, #10B981); /* Changed to light-theme gradient */
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .credits-header p {
                    font-size: 1.2rem;
                    color: #151516ff; /* Changed to darker gray text */
                    max-width: 600px;
                }
                .team-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2rem;
                    width: 100%;
                    max-width: 1200px;
                }
                .team-card {
                    background: #ffffffff; /* Changed to solid white */
                    border: 1px solid #e1e1e1ff; /* Changed to light gray border */
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    border-radius: 1rem;
                    padding: 2rem;
                    text-align: center;
                    transition: all 0.3s ease;
                    animation: popIn 0.5s ease-out backwards;
                }
                @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                .team-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                    border-color: #4F46E5; /* Changed to primary blue on hover */
                }
                .team-card h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    margin: 0 0 0.5rem 0;
                    color: #111827; /* Ensured dark text */
                }
                .team-card span {
                    font-size: 1rem;
                    color: #4F46E5; /* Changed to primary blue */
                    font-weight: 500;
                }
                .back-home-link {
                    margin-top: 4rem;
                    padding: 0.8rem 1.75rem;
                    border: 2px solid #4F46E5; /* Changed to primary blue */
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    color: #4F46E5; /* Changed to primary blue */
                    text-decoration: none;
                    transition: all 0.3s ease;
                }
                .back-home-link:hover {
                    background: #42ce9bff; /* Changed to primary blue */
                    color: #FFFFFF; /* Changed to white text on hover */
                    box-shadow: 0 0 15px rgba(79, 70, 229, 0.4);
                }
            `}</style>
            <div className="credits-header">
                <h1>Meet the Team</h1>
                <p>This project was brought to life by a dedicated team of developers, each contributing their unique expertise to build a powerful healthcare management system (Total Health).</p>
            </div>
            <div className="team-grid">
                {teamMembers.map((member, index) => (
                    <div key={member.name} className="team-card" style={{ animationDelay: `${index * 100}ms` }}>
                        <h3>{member.name}</h3>
                        <span>{member.role}</span>
                    </div>
                ))}
            </div>
            <Link to="/" className="back-home-link">Back to Home</Link>
        </div>
    );
}

export default Credits;

