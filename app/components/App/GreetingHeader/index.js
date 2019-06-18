/**
 *
 * GreetingHeader
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import { format } from 'date-fns';
import {
  makeNameSelector,
  makeSurnameSelector,
  makeEmailSelector,
  makeLastSuccessfulLoggedSelector,
  makeLastPresentLoggedSelector,
  makeLastFailedLoggedSelector,
} from 'containers/DashboardPage/selectors';
import {
  getNameAction,
  getSurnameAction,
  getLastPresentLoggedAction,
  getLastSuccessfulLoggedAction,
  getLastFailedLoggedAction,
  getEmailAction,
} from 'containers/DashboardPage/actions';
import saga from 'containers/DashboardPage/saga';
import reducer from 'containers/DashboardPage/reducer';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import messages from './messages';
import HeadlineWrapper from './HeadlineWrapper';
import HeadlineNameWrapper from './HeadlineNameWrapper';
import TextWrapper from './TextWrapper';

function GreetingHeader({
  name,
  surname,
  email,
  locale,
  lastSuccessfulLogged,
  lastPresentLogged,
  lastFailedLogged,
  getName,
  getSurname,
  getEmail,
  getLastPresentLogged,
  getLastSuccessfulLogged,
  getLastFailedLogged,
  isGreetingEvening,
}) {
  useInjectSaga({ key: 'dashboardPage', saga });
  useInjectReducer({ key: 'dashboardPage', reducer });
  useEffect(() => {
    if (!name) getName();
    if (!surname) getSurname();
    if (!email) getEmail();
    if (!lastPresentLogged) getLastPresentLogged();
    if (!lastSuccessfulLogged) getLastSuccessfulLogged();
    if (!lastFailedLogged) getLastFailedLogged();
  }, []);

  return (
    <HeadlineWrapper
      name={name}
      surname={surname}
      lastPresentLogged={lastPresentLogged}
      lastSuccessfulLogged={lastSuccessfulLogged}
    >
      <TextWrapper>
        {isGreetingEvening(
          locale,
          format(new Date(), 'hh'),
          format(new Date(), 'A'),
        ) || isGreetingEvening(locale, format(new Date(), 'HH')) ? (
            <FormattedMessage {...messages.greetingPm} />
        ) : (
            <FormattedMessage {...messages.greetingAm} />
          )}

        <HeadlineNameWrapper>
          {', '} {name} {surname}
        </HeadlineNameWrapper>
      </TextWrapper>
      <TextWrapper>
        <FormattedMessage {...messages.lastSuccessfulLoginInformation} />{' '}
        <time>
          {format(
            lastSuccessfulLogged || lastPresentLogged,
            `DD.MM.YYYY, ${locale === 'en' ? 'hh:MM A' : 'HH:MM'}`,
          )}
        </time>
      </TextWrapper>

      {lastFailedLogged && (
        <TextWrapper lastFailedLogged={lastFailedLogged}>
          <FormattedMessage {...messages.lastFailedLoginInformation} />{' '}
          <time>
            {format(
              lastFailedLogged,
              `DD.MM.YYYY, ${locale === 'en' ? 'hh:MM A' : 'HH:MM'}`,
            )}
          </time>
        </TextWrapper>
      )}
    </HeadlineWrapper>
  );
}

GreetingHeader.propTypes = {
  name: PropTypes.string,
  surname: PropTypes.string,
  email: PropTypes.string,
  locale: PropTypes.string,
  lastSuccessfulLogged: PropTypes.string,
  lastPresentLogged: PropTypes.string,
  lastFailedLogged: PropTypes.string,
  getName: PropTypes.func,
  getSurname: PropTypes.func,
  getEmail: PropTypes.func,
  getLastPresentLogged: PropTypes.func,
  getLastSuccessfulLogged: PropTypes.func,
  getLastFailedLogged: PropTypes.func,
  isGreetingEvening: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  name: makeNameSelector(),
  surname: makeSurnameSelector(),
  email: makeEmailSelector(),
  locale: makeSelectLocale(),
  lastPresentLogged: makeLastPresentLoggedSelector(),
  lastSuccessfulLogged: makeLastSuccessfulLoggedSelector(),
  lastFailedLogged: makeLastFailedLoggedSelector(),
});

function mapDispatchToProps(dispatch) {
  return {
    getName: () => dispatch(getNameAction()),
    getSurname: () => dispatch(getSurnameAction()),
    getEmail: () => dispatch(getEmailAction()),
    getLastPresentLogged: () => dispatch(getLastPresentLoggedAction()),
    getLastSuccessfulLogged: () => dispatch(getLastSuccessfulLoggedAction()),
    getLastFailedLogged: () => dispatch(getLastFailedLoggedAction()),
    isGreetingEvening: (locale, hour, meridiem) => {
      if (
        (locale === 'en' && (hour >= 7 && meridiem === 'PM')) ||
        (hour <= 5 && meridiem === 'AM') ||
        (locale !== 'en' && (hour >= 19 || hour <= 5))
      )
        return true;
      return false;
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(GreetingHeader);