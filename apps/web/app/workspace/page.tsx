"use client"
import Sidebar from '@/components/Sidebar'
import { Paperclip, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
const Workspace = () => {
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [prompt, setPrompt] = useState('')
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }
    const handleSend = async () => {
        const response = await fetch('/api/generate-manim', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        });
        const { id } = await response.json();
        router.push(`/workspace/${id}`)
        // setGeneratedCode(data.text);
    }
    return (
        <div className='h-screen flex flex-row items-center justify-center min-h-screen bg-background'>
            <div className='items-start'>
                <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
            </div>
            <div className='flex flex-col flex-1 items-center justify-center'>
                <h1 className='mx-auto text-card-foreground text-5xl font-bold'>What can i help you fix today?</h1>
                <div className=" border  rounded-lg overflow-hidden mt-10">
                    <div className="flex items-center gap-3 p-4 ">
                        <div className="flex-1">
                            <div className="w-full max-w-3xl mx-auto">
                                <textarea
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Log the error so Fix-ops can fix it for you."
                                    className="w-[600px] min-h-[60px] border-[#E4D9BC] bg-transparent text-card-foreground resize-none outline-none"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <button className="text-card-foreground cursor-pointer  p-2 rounded-lg transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <button className=" p-2 rounded-lg  transition-colors cursor-pointer" onClick={handleSend}>
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Workspace