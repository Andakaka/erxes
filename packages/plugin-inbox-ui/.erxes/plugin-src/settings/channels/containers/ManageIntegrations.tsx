import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import ManageIntegrations from '@erxes/ui-inbox/src/settings/integrations/containers/common/ManageIntegrations';
import { integrationsListParams } from '@erxes/ui-inbox/src/settings/integrations/containers/utils';
import { queries as integQueries } from '@erxes/ui-inbox/src/settings/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  EditChannelMutationResponse,
  EditChannelMutationVariables,
} from '../types';
import { IChannelDoc } from '@erxes/ui-settings/src/channels/types';

type Props = {
  currentChannel: IChannelDoc;
  queryParams: any;
};

type FinalProps = Props & EditChannelMutationResponse;

class ManageIntegrationsContainer extends React.Component<FinalProps, {}> {
  save = (integrationIds: string[]): Promise<any> => {
    const { currentChannel, editMutation } = this.props;

    return editMutation({
      variables: {
        _id: currentChannel._id,
        name: currentChannel.name,
        integrationIds,
        memberIds: currentChannel.memberIds
      }
    })
      .then(() => {
        Alert.success('You successfully managed an integration');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { currentChannel } = this.props;

    const updatedProps = {
      ...this.props,
      current: currentChannel,
      save: this.save
    };

    return <ManageIntegrations {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, EditChannelMutationResponse, EditChannelMutationVariables>(
      gql(mutations.channelEdit),
      {
        name: 'editMutation',
        options: ({
          queryParams,
          currentChannel
        }: {
          queryParams: any;
          currentChannel: IChannelDoc;
        }) => {
          return {
            refetchQueries: [
              {
                query: gql(integQueries.integrations),
                variables: {
                  channelId: currentChannel._id,
                  ...integrationsListParams(queryParams)
                }
              },
              {
                query: gql(queries.channelDetail),
                variables: { _id: currentChannel._id }
              },
              {
                query: gql(queries.integrationsCount),
                variables: { channelId: currentChannel._id }
              }
            ]
          };
        }
      }
    )
  )(ManageIntegrationsContainer)
);
