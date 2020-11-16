import Vue from 'vue';
import { mount } from '@vue/test-utils';
import { options, mocks } from '~/tests/mocks/mount';
import PlaylistModal from './PlaylistModal.vue';
import type { VHas } from '~~/types';

type Form = {
  name: string;
  description: string;
  isPrivate: boolean;
  isCollaborative: boolean;
  playlistId?: string ;
}
// type Playlist = Omit<Form, 'artwork'> & { artwork: File | undefined; };

const CLICK = 'click';
const INPUT = 'input';

const $spotifyMock = {
  playlists: {
    uploadPlaylistArtwork: jest.fn().mockReturnValue(undefined),
  },
};
const form = (
  i: number,
  isPrivate: boolean = false,
  isCollaborative: boolean = false,
): Form => ({
  playlistId: `playlistId${i}`,
  name: `name${i}`,
  description: `description${i}`,
  isPrivate,
  isCollaborative,
});
const handlerMock = jest.fn().mockResolvedValue(undefined);

const factory = (propsData: {
  value: boolean;
  form?: Form;
  detailText: string;
  handlerText?: string;
}) => {
  const vm = mount(PlaylistModal, {
    ...options,
    propsData: {
      ...propsData,
      handler: handlerMock,
    },
    mocks: {
      ...mocks,
      $spotify: $spotifyMock,
      $subscribe: jest.fn(),
      $screen: {
        isSingleColumn: false,
      },
    },
  });
  return vm;
};

describe('PlaylistModal', () => {
  it('toggle modal', async () => {
    const wrapper = factory({
      value: false,
      detailText: '作成',
    });
    expect(wrapper.findComponent({ name: 'VDialog' }).props().value).toBe(false);
    await wrapper.setProps({
      value: true,
    });
    expect(wrapper.findComponent({ name: 'VDialog' }).props().value).toBe(true);
  });

  it('without initial form', () => {
    const wrapper = factory({
      value: true,
      detailText: '作成',
    });
    const inputs = wrapper.findAll('.v-form > *');
    expect((inputs.at(0).find('input').element as HTMLInputElement).value).toBe('');
    expect((inputs.at(1).find('textarea').element as HTMLTextAreaElement).value).toBe('');
    expect((inputs.at(2).find('input').element as HTMLInputElement).value).toBe('');
    expect((inputs.at(3).find('input').element as HTMLInputElement).checked).toBe(false);
    expect((inputs.at(4).find('input').element as HTMLInputElement).checked).toBe(false);
  });

  it('with initial form', () => {
    const wrapper = factory({
      value: true,
      form: form(1, true, true),
      detailText: '作成',
    });
    const inputs = wrapper.findAll('.v-form > *');
    expect((inputs.at(0).find('input').element as HTMLInputElement).value).toBe('name1');
    expect((inputs.at(1).find('textarea').element as HTMLTextAreaElement).value).toBe('description1');
    expect((inputs.at(2).find('input').element as HTMLInputElement).value).toBe('');
    expect((inputs.at(3).find('input').element as HTMLInputElement).checked).toBe(true);
    expect((inputs.at(4).find('input').element as HTMLInputElement).checked).toBe(true);
  });

  it('without detailText prop', () => {
    const wrapper = factory({
      value: true,
      form: form(1),
      detailText: '編集',
    });
    expect(wrapper.find('.v-card__actions > .v-btn:nth-child(2)').text()).toBe('編集');
  });

  it('with detailText prop', () => {
    const wrapper = factory({
      value: true,
      form: form(1),
      detailText: '編集',
      handlerText: '更新',
    });
    expect(wrapper.find('.v-card__actions > .v-btn:nth-child(2)').text()).toBe('更新');
  });

  it('exists FORM_REF', () => {
    const wrapper = factory({
      value: true,
      detailText: '作成',
    });
    expect((wrapper.vm as VHas<'FORM_REF'>).FORM_REF).toBeTruthy();
  });

  it('validate empty name', async () => {
    const wrapper = factory({
      value: true,
      detailText: '作成',
    });
    const input = wrapper.find('.v-form > *:first-child input');
    const vButton = wrapper.find('.v-card__actions > .v-btn:nth-child(2)');
    const vForm = wrapper.findComponent({ name: 'VForm' });
    expect(vButton.props().disabled).toBe(true);
    expect(vForm.props().value).toBe(false);

    await input.setValue('a');
    await Vue.nextTick();
    expect(vButton.props().disabled).toBe(false);
    expect(vForm.props().value).toBe(true);

    await input.setValue('');
    await Vue.nextTick();
    expect(vButton.props().disabled).toBe(true);
    expect(vForm.props().value).toBe(false);
  });

  it('validate large image', async () => {
    const wrapper = factory({
      value: true,
      form: form(1),
      detailText: '編集',
      handlerText: '更新',
    });
    const vButton = wrapper.find('.v-card__actions > .v-btn:nth-child(2)');
    const vForm = wrapper.findComponent({ name: 'VForm' });
    expect(vButton.props().disabled).toBe(false);
    expect(vForm.props().value).toBe(true);

    await wrapper.setData({
      playlist: {
        ...form(1),
        // 256 kB の jpeg ファイル
        artwork: new File(new Array(256 * 1000).fill(0), 'image', {
          type: 'image/jpeg',
        }),
      },
    });
    await Vue.nextTick();
    expect(vButton.props().disabled).toBe(false);
    expect(vForm.props().value).toBe(true);

    await wrapper.setData({
      playlist: {
        ...form(1),
        // 256.001 kB の jpeg ファイル
        artwork: new File(new Array(256 * 1000 + 1).fill(0), 'image', {
          type: 'image/jpeg',
        }),
      },
    });
    await Vue.nextTick();
    expect(vButton.props().disabled).toBe(true);
    expect(vForm.props().value).toBe(false);
    expect(wrapper.find('.v-messages__message').text()).toBe('アップロードできるファイルの最大サイズは 256kB です。');
  });

  it('validate image type', async () => {
    const wrapper = factory({
      value: true,
      form: form(1),
      detailText: '編集',
      handlerText: '更新',
    });
    const vButton = wrapper.find('.v-card__actions > .v-btn:nth-child(2)');
    const vForm = wrapper.findComponent({ name: 'VForm' });
    expect(vButton.props().disabled).toBe(false);
    expect(vForm.props().value).toBe(true);

    await wrapper.setData({
      playlist: {
        ...form(1),
        artwork: new File(new Array(1000).fill(0), 'image', {
          type: 'image/png',
        }),
      },
    });
    await Vue.nextTick();
    expect(vButton.props().disabled).toBe(true);
    expect(vForm.props().value).toBe(false);
    expect(wrapper.find('.v-messages__message').text()).toBe('アップロードできるファイル形式は jpeg のみです。');
  });

  it('set isPrivate true when isCollaborative is set to true', async () => {
    const wrapper = factory({
      value: true,
      detailText: '作成',
    });
    const isPrivateInputElement = wrapper.find('.v-form > *:nth-child(4) input').element as HTMLInputElement;
    const isCollaborativeInput = wrapper.find('.v-form > *:nth-child(5) input');
    const isCollaborativeInputElement = wrapper.find('.v-form > *:nth-child(5) input').element as HTMLInputElement;
    expect(isPrivateInputElement.checked).toBe(false);
    expect(isPrivateInputElement.disabled).toBe(false);
    expect(isCollaborativeInputElement.checked).toBe(false);

    await isCollaborativeInput.setChecked(true);
    expect(isPrivateInputElement.checked).toBe(true);
    expect(isPrivateInputElement.disabled).toBe(true);
    expect(isCollaborativeInputElement.checked).toBe(true);

    await isCollaborativeInput.setChecked(false);
    expect(isPrivateInputElement.checked).toBe(true);
    expect(isPrivateInputElement.disabled).toBe(false);
    expect(isCollaborativeInputElement.checked).toBe(false);
  });

  it('cancel modal', async () => {
    const wrapper = await factory({
      value: true,
      detailText: '作成',
    });
    await wrapper.find('.v-card__actions > .v-btn:nth-child(1)').trigger(CLICK);
    expect((wrapper.emitted(INPUT)?.[0][0])).toBe(false);
  });

  it('handle playlist without initial form', async () => {
    const wrapper = await factory({
      value: true,
      detailText: '作成',
    });
    await wrapper.find('.v-form > *:first-child input').setValue('a');
    await Vue.nextTick();
    const vButton = wrapper.find('.v-card__actions > .v-btn:nth-child(2)');
    await vButton.trigger(CLICK);
    expect(handlerMock).toHaveBeenCalledWith({
      playlistId: '',
      name: 'a',
      description: '',
      isPublic: true,
      isCollaborative: false,
    });
  });

  it('handle playlist with initial form', async () => {
    const wrapper = await factory({
      value: true,
      detailText: '編集',
      handlerText: '更新',
      form: form(1),
    });
    await wrapper.find('.v-card__actions > .v-btn:nth-child(2)').trigger(CLICK);
    const f = form(1);
    expect(handlerMock).toHaveBeenCalledWith({
      playlistId: f.playlistId,
      name: f.name,
      description: f.description,
      isPublic: !f.isPrivate,
      isCollaborative: f.isCollaborative,
    });
  });

  // @todo subscribePlaylist, emit('update:image) のテスト
});
