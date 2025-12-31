import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {COLORS} from '../../../constants/colors';
import {t} from '../../../i18n';

// Icons
import userIcon from '../../../assets/icons/user.png';
import whatsappIcon from '../../../assets/icons/whatsapp.png';
import editIcon from '../../../assets/icons/edit.png';

interface AssignedClient {
  id: string;
  name: string;
  workoutAssigned: string;
  ptPlanName: string;
  sessionsTotal: number;
  sessionsRemaining: number;
  nextSessionDate: string;
}

interface Session {
  id: string;
  date: string;
  time: string;
  customer: string;
  isUpcoming: boolean;
}

const MOCK_CLIENTS: AssignedClient[] = [
  {
    id: '1',
    name: 'Deepak Singh',
    workoutAssigned: "Beginner's 3 day",
    ptPlanName: '24 Sessions',
    sessionsTotal: 24,
    sessionsRemaining: 12,
    nextSessionDate: '24 August 2025',
  },
  {
    id: '2',
    name: 'Deepak Singh',
    workoutAssigned: "Beginner's 3 day",
    ptPlanName: '24 Sessions',
    sessionsTotal: 24,
    sessionsRemaining: 12,
    nextSessionDate: '24 August 2025',
  },
  {
    id: '3',
    name: 'Deepak Singh',
    workoutAssigned: "Beginner's 3 day",
    ptPlanName: '24 Sessions',
    sessionsTotal: 24,
    sessionsRemaining: 12,
    nextSessionDate: '24 August 2025',
  },
];

const MOCK_UPCOMING_SESSIONS: Session[] = [
  {
    id: '1',
    date: '20 Apr 2025',
    time: '11:00 AM - 12 pm',
    customer: 'Rahul Sharma',
    isUpcoming: true,
  },
  {
    id: '2',
    date: '23 Apr 2025',
    time: '12:30 AM - 1:30 AM',
    customer: 'Rahul Sharma',
    isUpcoming: true,
  },
];

const MOCK_PAST_SESSIONS: Session[] = [
  {
    id: '1',
    date: '20 Apr 2025',
    time: '11:00 AM - 12:00 pm',
    customer: 'Rahul Sharma',
    isUpcoming: false,
  },
  {
    id: '2',
    date: '23 Apr 2025',
    time: '12:30 AM - 1:30 AM',
    customer: 'Rahul Sharma',
    isUpcoming: false,
  },
];

const ITEMS_PER_PAGE = 3;

export const ClientTab: React.FC = () => {
  const [clients] = useState<AssignedClient[]>(MOCK_CLIENTS);
  const [upcomingSessions] = useState<Session[]>(MOCK_UPCOMING_SESSIONS);
  const [pastSessions] = useState<Session[]>(MOCK_PAST_SESSIONS);
  const [clientsPage, setClientsPage] = useState(1);
  const [pastSessionsPage, setPastSessionsPage] = useState(1);

  const totalClientsPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const totalPastSessionsPages = Math.ceil(pastSessions.length / ITEMS_PER_PAGE);

  const paginatedClients = clients.slice(
    (clientsPage - 1) * ITEMS_PER_PAGE,
    clientsPage * ITEMS_PER_PAGE,
  );

  const paginatedPastSessions = pastSessions.slice(
    (pastSessionsPage - 1) * ITEMS_PER_PAGE,
    pastSessionsPage * ITEMS_PER_PAGE,
  );

  const handleWhatsApp = useCallback((_clientId: string) => {
    // Handle WhatsApp action
    console.log('Opening WhatsApp for client:', _clientId);
  }, []);

  const handleEdit = useCallback((_clientId: string) => {
    // Handle edit action
    console.log('Editing client:', _clientId);
  }, []);

  const handleCancelSession = useCallback((_sessionId: string) => {
    // Handle cancel session
    console.log('Cancelling session:', _sessionId);
  }, []);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (page: number) => void,
    totalItems: number,
  ) => {
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          Showing {startItem} to {endItem} of {totalItems} entries
        </Text>
        <View style={styles.paginationButtons}>
          <TouchableOpacity
            style={styles.paginationArrow}
            onPress={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            <Text style={[styles.paginationArrowText, currentPage === 1 && styles.paginationDisabled]}>
              {'<'}
            </Text>
          </TouchableOpacity>
          {Array.from({length: Math.min(totalPages, 3)}, (_, i) => i + 1).map(page => (
            <TouchableOpacity
              key={page}
              style={[
                styles.paginationNumber,
                currentPage === page && styles.paginationNumberActive,
              ]}
              onPress={() => onPageChange(page)}>
              <Text
                style={[
                  styles.paginationNumberText,
                  currentPage === page && styles.paginationNumberTextActive,
                ]}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}
          {totalPages > 3 && (
            <>
              <Text style={styles.paginationDots}>.....</Text>
              <TouchableOpacity
                style={styles.paginationNumber}
                onPress={() => onPageChange(totalPages)}>
                <Text style={styles.paginationNumberText}>{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.paginationArrow}
            onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}>
            <Text style={[styles.paginationArrowText, currentPage === totalPages && styles.paginationDisabled]}>
              {'>'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderClientCard = (client: AssignedClient) => (
    <View key={client.id} style={styles.clientCard}>
      <View style={styles.clientCardContent}>
        {/* Avatar on far left */}
        <View style={styles.avatarContainer}>
          <Image source={userIcon} style={styles.userIcon} resizeMode="contain" />
        </View>

        {/* Two columns of details */}
        <View style={styles.detailsContainer}>
          {/* Left Column: Name, PT Plan, Next Session */}
          <View style={styles.leftColumn}>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>{t('client.name')}</Text>
              <Text style={styles.clientValue}>{client.name}</Text>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>{t('client.ptPlanName')}</Text>
              <Text style={styles.clientValue}>{client.ptPlanName}</Text>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>{t('client.nextSessionDate')}</Text>
              <Text style={styles.clientValue}>{client.nextSessionDate}</Text>
            </View>
          </View>

          {/* Right Column: Workout Assigned, Sessions Remaining, WhatsApp */}
          <View style={styles.rightColumn}>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>{t('client.workoutAssigned')}</Text>
              <View style={styles.workoutAssignedRow}>
                <Text style={styles.clientValueLink}>{client.workoutAssigned}</Text>
                <TouchableOpacity onPress={() => handleEdit(client.id)}>
                  <Image source={editIcon} style={styles.editIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.clientRow}>
              <Text style={styles.clientLabel}>{t('client.sessionsRemaining')}</Text>
              <Text style={styles.clientValue}>{client.sessionsRemaining}</Text>
            </View>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => handleWhatsApp(client.id)}>
              <Image source={whatsappIcon} style={styles.whatsappIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Assigned Clients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('client.assignedClients')}</Text>
        {paginatedClients.length === 0 ? (
          <Text style={styles.emptyText}>{t('client.noClients')}</Text>
        ) : (
          paginatedClients.map(renderClientCard)
        )}
        {clients.length > ITEMS_PER_PAGE &&
          renderPagination(clientsPage, totalClientsPages, setClientsPage, clients.length)}
      </View>

      {/* Upcoming Sessions Section */}
      <View style={styles.section}>
        <View style={styles.sessionsTable}>
          <View style={styles.sessionsTitleContainer}>
            <Text style={styles.sessionsTableTitle}>{t('client.upcomingSessions')}</Text>
          </View>
          <View style={styles.tableDivider} />
          {upcomingSessions.length === 0 ? (
            <Text style={styles.emptyTextInCard}>{t('client.noUpcomingSessions')}</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>{t('client.date')}</Text>
                <Text style={[styles.tableHeaderText, styles.timeColumn]}>{t('client.time')}</Text>
                <Text style={[styles.tableHeaderText, styles.customerColumn]}>{t('client.customer')}</Text>
                <Text style={[styles.tableHeaderText, styles.actionColumn]}>{t('client.action')}</Text>
              </View>
              {upcomingSessions.map(session => (
                <View key={session.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.dateColumn]}>{session.date}</Text>
                  <Text style={[styles.tableCell, styles.timeColumn]}>{session.time}</Text>
                  <Text style={[styles.tableCell, styles.customerColumn]}>{session.customer}</Text>
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelSession(session.id)}>
                      <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </View>

      {/* Past Sessions Section */}
      <View style={styles.section}>
        <View style={styles.sessionsTable}>
          <View style={styles.sessionsTitleContainer}>
            <Text style={styles.sessionsTableTitle}>{t('client.pastSessions')}</Text>
          </View>
          <View style={styles.tableDivider} />
          {pastSessions.length === 0 ? (
            <Text style={styles.emptyTextInCard}>{t('client.noPastSessions')}</Text>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.dateColumn]}>{t('client.date')}</Text>
                <Text style={[styles.tableHeaderText, styles.timeColumnWide]}>{t('client.time')}</Text>
                <Text style={[styles.tableHeaderText, styles.customerColumn]}>{t('client.customer')}</Text>
              </View>
              {paginatedPastSessions.map(session => (
                <View key={session.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.dateColumn]}>{session.date}</Text>
                  <Text style={[styles.tableCell, styles.timeColumnWide]}>{session.time}</Text>
                  <Text style={[styles.tableCell, styles.customerColumn]}>{session.customer}</Text>
                </View>
              ))}
            </>
          )}
        </View>
        {pastSessions.length > ITEMS_PER_PAGE &&
          renderPagination(
            pastSessionsPage,
            totalPastSessionsPages,
            setPastSessionsPage,
            pastSessions.length,
          )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  clientCard: {
    backgroundColor: COLORS.surface.light,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  clientCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  rightColumn: {
    flex: 1,
  },
  clientRow: {
    marginBottom: 2,
  },
  clientLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
  },
  clientValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
  },
  clientValueLink: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.primary,
  },
  workoutAssignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  editIcon: {
    width: 12,
    height: 12,
    tintColor: COLORS.primary,
  },
  whatsappButton: {
    marginTop: 2,
  },
  whatsappIcon: {
    width: 20,
    height: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  paginationContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
    marginBottom: 8,
  },
  paginationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paginationArrow: {
    padding: 8,
  },
  paginationArrowText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.primary,
  },
  paginationDisabled: {
    color: COLORS.gray[300],
  },
  paginationNumber: {
    width: 28,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationNumberActive: {
    backgroundColor: COLORS.primary,
  },
  paginationNumberText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: COLORS.text.light.primary,
  },
  paginationNumberTextActive: {
    color: COLORS.white,
  },
  paginationDots: {
    fontSize: 12,
    color: COLORS.text.light.secondary,
  },
  sessionsTable: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.surface.light,
  },
  sessionsTitleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  sessionsTableTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
    textAlign: 'left',
  },
  tableDivider: {
    height: 1,
    backgroundColor: COLORS.gray[400],
    marginHorizontal: 12,
  },
  emptyTextInCard: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.secondary,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray[50],
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: COLORS.text.light.primary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: COLORS.text.light.primary,
  },
  dateColumn: {
    flex: 1,
  },
  timeColumn: {
    flex: 1.2,
  },
  timeColumnWide: {
    flex: 1.5,
  },
  customerColumn: {
    flex: 1.2,
  },
  actionColumn: {
    flex: 0.8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelButtonText: {
    fontSize: 11,
    fontFamily: 'Poppins-Medium',
    color: COLORS.white,
  },
});
