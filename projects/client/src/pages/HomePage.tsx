// React imports for hooks and component functionality
import React, { useEffect, useState } from 'react';
// React Router for navigation
import { useNavigate } from 'react-router-dom';
// Type definitions for TypeScript type safety
import type { GraphLink, GraphNode, NetlistData, Submission } from '../types';
// GraphCanvas component for rendering the interactive PCB visualization
import GraphCanvas from '../components/GraphCanvas';
// Utility functions for netlist processing and validation
import { convertToGraph, validateNetlist } from '../utils/graph';
// API service functions for backend communication
import { get, post } from '../services/ApiService';

/**
 * HomePage Component
 * 
 * Main application page that handles PCB netlist file uploads, validation,
 * visualization, and submission management. Provides an interface for users
 * to upload JSON netlist files and view them as interactive schematic diagrams.
 * 
 * Features:
 * - File upload and JSON parsing
 * - Netlist validation with error reporting
 * - Interactive graph visualization
 * - Submission history tracking
 * - Circuit statistics display
 */
function HomePage() {
  // Navigation hook for programmatic routing
  const navigate = useNavigate();
  
  // State for the currently loaded netlist data
  const [netlist, setNetlist] = useState<NetlistData | null>(null);
  // State for validation errors to display to the user
  const [errors, setErrors] = useState<string[]>([]);
  // State for the processed graph data used by the visualization canvas
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(
    null
  );
  // State for tracking user submissions history
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  /**
   * Handles user logout by clearing authentication token and redirecting to login
   * 
   * Clears the JWT token from localStorage and navigates the user back to the
   * login page to ensure secure session termination.
   */
  const handleLogout = () => {
    // Clear authentication token from browser storage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  /**
   * Handles file upload events from the file input
   * 
   * Processes uploaded JSON files by:
   * 1. Reading the file content as text
   * 2. Parsing JSON and validating the netlist structure
   * 3. Converting netlist data to graph format for visualization
   * 4. Submitting data to backend for storage
   * 5. Updating component state with results or errors
   * 
   * @param e - File input change event containing the selected file
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create FileReader to read the uploaded file
    const reader = new FileReader();
    reader.onload = event => {
      try {
        // Parse the JSON file content
        const data = JSON.parse(event.target?.result as string);
        
        // Validate the netlist structure and get any errors
        const validationErrors = validateNetlist(data);
        
        // Update state with the parsed and validated data
        setNetlist(data);
        setErrors(validationErrors);
        setGraphData(convertToGraph(data));
        
        // Submit the netlist data to the backend for storage
        post('submissions', { data: JSON.stringify(data) }).then((result) => {
            // Add the new submission to the beginning of the submissions list
            setSubmissions([result, ...submissions]);
        }).catch(_err => {
            // Handle submission errors by adding to the errors list
            setErrors(['Failed to save submission.']);
        });
      } catch (err) {
        // Handle JSON parsing errors
        setErrors(['Invalid JSON file.']);
        setNetlist(null);
        setGraphData(null);
      }
    };
    // Read the file as text to trigger the onload event
    reader.readAsText(file);
  };

  /**
   * Handles loading a netlist from a previous submission
   * 
   * Parses the stored JSON data from a submission and loads it into the current view
   * for visualization and validation. Updates all relevant state including netlist,
   * errors, and graph data.
   * 
   * @param submission - The submission object containing the netlist data
   */
  const handleLoadSubmission = (submission: Submission) => {
    try {
      // Parse the JSON data stored in the submission
      const data = JSON.parse(submission.data);
      
      // Validate the netlist structure and get any errors
      const validationErrors = validateNetlist(data);
      
      // Update state with the loaded submission data
      setNetlist(data);
      setErrors(validationErrors);
      setGraphData(convertToGraph(data));
    } catch (err) {
      // Handle JSON parsing errors for corrupted submission data
      setErrors(['Failed to load submission: Invalid data format.']);
      setNetlist(null);
      setGraphData(null);
    }
  };

  /**
   * Effect hook to load submission history on component mount
   * 
   * Fetches all previous submissions from the backend when the component
   * first loads to populate the submission history sidebar.
   */
  useEffect(() => {
    const getSubmissions = async () => {
      const submissions: Submission[] = await get('submissions');
      setSubmissions(submissions);
    };

    getSubmissions();
  }, []);

  return (
    <div className="pcb-homepage">
      {/* Application Header */}
      <div className="pcb-header">
        <h1 className="pcb-title">PCB Netlist Visualizer</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="pcb-layout">
        {/* Left Sidebar - Contains file upload, circuit info, errors, and submission history */}
        <div className="pcb-sidebar">
          {/* File Upload Panel */}
          <div className="pcb-panel">
            <h3 className="panel-title">Upload Netlist Submission</h3>
            <div className="pcb-controls">
              <label className="file-input-label">
                <input type="file" accept=".json" onChange={handleFileUpload} />
                Submit Netlist
              </label>
            </div>
          </div>

          {/* Circuit Information Panel - Only shown when netlist is loaded */}
          {netlist && (
            <div className="pcb-panel">
              <h3 className="panel-title">Circuit Info</h3>
              <div className="circuit-stats">
                <div className="stat-item">
                  <span className="stat-label">Components:</span>
                  <span className="stat-value">{netlist.components.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Nets:</span>
                  <span className="stat-value">{netlist.nets.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Connections:</span>
                  <span className="stat-value">
                    {/* Calculate total connections across all nets */}
                    {netlist.nets.reduce((sum, net) => sum + net.connections.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Errors Panel - Only shown when errors exist */}
          {errors.length > 0 && (
            <div className="pcb-panel error-panel">
              <h3 className="panel-title">⚠ Validation Errors</h3>
              <ul className="error-list">
                {errors.map((error, i) => (
                  <li key={i} className="error-item">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submissions History Panel - Only shown when submissions exist */}
          {submissions.length > 0 && (
            <div className="pcb-panel">
              <h3 className="panel-title">Recent Submissions</h3>
              <div className="submissions-list">
                {submissions.map(submission => (
                  <button 
                    key={submission._id} 
                    className="submission-item"
                    onClick={() => handleLoadSubmission(submission)}
                  >
                    Submission on {new Date(submission.dateCreated).toLocaleString('en-US', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas Area - Shows either the visualization or placeholder */}
        <div className="pcb-canvas-area">
          {netlist ? (
            <div className="canvas-container">
              {/* Interactive graph visualization component */}
              <GraphCanvas netlist={netlist} graphData={graphData} validationErrors={errors} />
            </div>
          ) : (
            /* Placeholder shown when no netlist is loaded */
            <div className="pcb-placeholder">
              <div className="placeholder-content">
                <div className="placeholder-icon">📋</div>
                <h2>No Netlist Loaded</h2>
                <p>Load a netlist file to visualize your PCB schematic</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
