import type { Preview } from '@storybook/angular'
import { setCompodocJson } from "@storybook/addon-docs/angular";
import { applicationConfig } from '@storybook/angular';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CRDTService, WebSocketService, KanbanService } from '../src/app/kanban/services';
import { MockKanbanService } from '../src/app/kanban/services/mock-kanban.service';
import docJson from "../documentation.json";
setCompodocJson(docJson);

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [
        importProvidersFrom(BrowserAnimationsModule),
        CRDTService,
        WebSocketService,
        // Use mock service for Storybook
        { provide: KanbanService, useClass: MockKanbanService }
      ]
    })
  ],
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#fafbfc',
        },
        {
          name: 'dark',
          value: '#0d1117',
        },
      ],
    },
  },
};

export default preview;
