'use client';

import { useState } from 'react';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { 
  MessageCircle, 
  Code, 
  Copy, 
  Check,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function ChatbotDemoPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [selectedPosition, setSelectedPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');

  const embedCode = `<!-- AI Marketing Pro Chatbot Widget -->
<script>
  (function() {
    // Load the chatbot widget
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/chatbot-widget.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Initialize the widget
    script.onload = function() {
      window.ChatbotWidget.init({
        chatbotId: 'your-chatbot-id',
        apiKey: 'your-api-key',
        position: '${selectedPosition}',
        theme: '${selectedTheme}',
        welcomeMessage: 'Hello! How can I help you today?'
      });
    };
  })();
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Chatbot Widget Demo</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience our AI-powered chatbot widget in action. See how it can enhance your website's customer engagement.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Demo Controls */}
          <div className="space-y-8">
            {/* Widget Configuration */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Code className="h-6 w-6 text-purple-600 mr-2" />
                Widget Configuration
              </h2>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedTheme('light')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedTheme === 'light'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Monitor className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Light</div>
                          <div className="text-sm text-gray-500">Clean, bright interface</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedTheme('dark')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedTheme === 'dark'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Monitor className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Dark</div>
                          <div className="text-sm text-gray-500">Modern, sleek interface</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Position Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedPosition('bottom-right')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPosition === 'bottom-right'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Bottom Right</div>
                          <div className="text-sm text-gray-500">Standard position</div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedPosition('bottom-left')}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        selectedPosition === 'bottom-left'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Bottom Left</div>
                          <div className="text-sm text-gray-500">Alternative position</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Embed Code */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Code className="h-5 w-5 text-purple-600 mr-2" />
                Embed Code
              </h3>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <pre className="text-green-400 text-sm overflow-x-auto">
                  <code>{embedCode}</code>
                </pre>
              </div>
              
              <button
                onClick={copyToClipboard}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-5 w-5 mr-2" />
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Widget Features</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">24/7 AI-powered responses</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Multilingual support</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">FAQ integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Booking functionality</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Upselling suggestions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Mobile responsive</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Customizable themes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">Analytics tracking</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div className="space-y-8">
            {/* Demo Instructions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-6 w-6 text-purple-600 mr-2" />
                Live Demo
              </h2>
              <p className="text-gray-600 mb-4">
                Try the chatbot widget below! Click the chat button in the bottom corner to start a conversation.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> The widget will remember your conversation and can help with FAQs, 
                      booking appointments, and product recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Content */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sample Website Content</h3>
              <div className="prose max-w-none">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Our AI Marketing Agency</h4>
                <p className="text-gray-600 mb-4">
                  We help businesses grow with cutting-edge AI marketing solutions. Our chatbot can answer 
                  your questions about our services, help you book consultations, and provide personalized 
                  recommendations.
                </p>
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Our Services</h4>
                <ul className="list-disc list-inside text-gray-600 mb-4">
                  <li>AI Content Generation</li>
                  <li>Social Media Automation</li>
                  <li>SEO Optimization</li>
                  <li>Chatbot Development</li>
                  <li>Analytics & Reporting</li>
                </ul>

                <h4 className="text-lg font-semibold text-gray-900 mb-2">Get Started</h4>
                <p className="text-gray-600">
                  Ready to transform your marketing? Use the chat widget to:
                </p>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Ask questions about our services</li>
                  <li>Schedule a free consultation</li>
                  <li>Get pricing information</li>
                  <li>Learn about our AI solutions</li>
                </ul>
              </div>
            </div>

            {/* Mobile Preview */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Smartphone className="h-5 w-5 text-purple-600 mr-2" />
                Mobile Preview
              </h3>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="bg-white rounded-lg shadow-sm p-4 max-w-xs mx-auto">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Mobile Chat Widget</h4>
                    <p className="text-sm text-gray-600">Fully responsive design</p>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-100 rounded-lg p-2 text-sm">
                      <p className="text-gray-600">Hello! How can I help you today?</p>
                    </div>
                    <div className="bg-purple-600 rounded-lg p-2 text-sm text-white ml-8">
                      <p>I'd like to know about your services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Add AI Chat to Your Website?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using our AI chatbot to improve customer engagement, 
              reduce support costs, and increase conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700">
                Get Started Free
              </button>
              <button className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget
        chatbotId="demo-chatbot"
        apiKey="demo-api-key"
        position={selectedPosition}
        theme={selectedTheme}
        welcomeMessage="Hello! I'm your AI assistant. I can help you with questions about our services, booking consultations, and more. How can I assist you today?"
      />
    </div>
  );
}
