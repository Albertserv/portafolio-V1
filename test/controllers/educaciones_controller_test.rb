require "test_helper"

class EducacionesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get educaciones_index_url
    assert_response :success
  end

  test "should get new" do
    get educaciones_new_url
    assert_response :success
  end

  test "should get create" do
    get educaciones_create_url
    assert_response :success
  end

  test "should get edit" do
    get educaciones_edit_url
    assert_response :success
  end

  test "should get update" do
    get educaciones_update_url
    assert_response :success
  end

  test "should get destroy" do
    get educaciones_destroy_url
    assert_response :success
  end
end
