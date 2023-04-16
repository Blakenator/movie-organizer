import React from 'react';
import { RenameReport } from '../../../../common/types';
import { Accordion, Modal, Spinner } from 'react-bootstrap';

interface RenameReportModalProps {
  report: RenameReport;
  loading: boolean;
  onDismiss: () => void;
  titleById?: Record<string, string>;
}

export const RenameReportModal: React.FC<RenameReportModalProps> = ({
  report,
  loading,
  onDismiss,
  titleById,
}) => {
  return loading || report ? (
    <Modal show={true} centered>
      {loading ? (
        <div className="p-5 m-5 d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Modal.Header>Rename Report</Modal.Header>
          <Modal.Body>
            <Accordion>
              <Accordion.Item eventKey="renamed">
                <Accordion.Header>
                  Items Renamed ({report.renamedIds.length})
                </Accordion.Header>
                <Accordion.Body>
                  {report.renamedIds.length === 0 && (
                    <span className="text-muted">Nothing to report</span>
                  )}
                  <ul>
                    {report.renamedIds.map(({ value, message }) => (
                      <li key={value}>
                        {titleById?.[value] ?? value} - {message}
                      </li>
                    ))}
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="skipped">
                <Accordion.Header>
                  Items skipped ({report.skippedIds.length})
                </Accordion.Header>
                <Accordion.Body>
                  {report.skippedIds.length === 0 && (
                    <span className="text-muted">Nothing to report</span>
                  )}
                  <ul>
                    {report.skippedIds.map(({ value, message }) => (
                      <li key={value}>
                        {titleById?.[value] ?? value} - {message}
                      </li>
                    ))}
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="skippedPaths">
                <Accordion.Header>
                  Files Skipped ({report.skippedPaths.length})
                </Accordion.Header>
                <Accordion.Body>
                  {report.skippedPaths.length === 0 && (
                    <span className="text-muted">Nothing to report</span>
                  )}
                  <ul>
                    {report.skippedPaths.map(({ value, message }) => (
                      <li key={value}>
                        {value} - {message}
                      </li>
                    ))}
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="skippedCleanup">
                <Accordion.Header>
                  Leftover folders (non-empty) (
                  {report.skippedCleanupPaths.length})
                </Accordion.Header>
                <Accordion.Body>
                  {report.skippedCleanupPaths.length === 0 && (
                    <span className="text-muted">Nothing to report</span>
                  )}
                  <ul>
                    {report.skippedCleanupPaths.map(({ value, message }) => (
                      <li key={value}>
                        {value} - {message}
                      </li>
                    ))}
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-primary" onClick={onDismiss}>
              Close
            </button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  ) : null;
};
